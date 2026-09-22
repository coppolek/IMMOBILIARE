import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Listing, SeekerProfile } from '../types';
import { INITIAL_LISTINGS, INITIAL_SEEKERS } from '../data/milanData';

const LISTINGS_COLLECTION = 'listings';
const SEEKERS_COLLECTION = 'seekers';

/**
 * Seed initial data into Firestore ensuring only the file listings are present
 */
export async function seedInitialDataIfEmpty() {
  try {
    const listingsSnap = await getDocs(collection(db, LISTINGS_COLLECTION));
    const validFileIds = new Set(INITIAL_LISTINGS.map(l => l.id));

    // Delete obsolete non-file listings in batch
    const obsoleteDocs = listingsSnap.docs.filter(d => !validFileIds.has(d.id));
    if (obsoleteDocs.length > 0) {
      const deleteBatch = writeBatch(db);
      for (const d of obsoleteDocs) {
        deleteBatch.delete(d.ref);
      }
      await deleteBatch.commit();
    }

    // Collect existing document IDs
    const existingIds = new Set(listingsSnap.docs.map(d => d.id));

    // Always update listings with externalListingUrl / source if missing in Firestore or not yet synced
    const toUpdate = INITIAL_LISTINGS.filter(l => {
      if (!existingIds.has(l.id)) return true;
      const existingDoc = listingsSnap.docs.find(d => d.id === l.id);
      const data = existingDoc?.data();
      return !data?.externalListingUrl && !!l.externalListingUrl;
    });

    if (toUpdate.length > 0) {
      // Chunk writes by 400 (Firestore batch limit is 500)
      const chunkSize = 400;
      for (let i = 0; i < toUpdate.length; i += chunkSize) {
        const chunk = toUpdate.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        for (const listing of chunk) {
          const docRef = doc(db, LISTINGS_COLLECTION, listing.id);
          batch.set(docRef, {
            ...listing,
            dbTimestamp: serverTimestamp(),
          }, { merge: true });
        }
        await batch.commit();
      }
    }

    const seekersSnap = await getDocs(collection(db, SEEKERS_COLLECTION));
    if (seekersSnap.empty && INITIAL_SEEKERS.length > 0) {
      const seekerBatch = writeBatch(db);
      for (const seeker of INITIAL_SEEKERS) {
        const docRef = doc(db, SEEKERS_COLLECTION, seeker.id);
        seekerBatch.set(docRef, {
          ...seeker,
          dbTimestamp: serverTimestamp(),
        });
      }
      await seekerBatch.commit();
    }
  } catch (error) {
    console.warn('Firestore seeding check encountered an issue (fallback active):', error);
  }
}

/**
 * Real-time listener for listings
 */
export function subscribeToListings(callback: (listings: Listing[]) => void) {
  const q = collection(db, LISTINGS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: Listing[] = [];
    snapshot.forEach((doc) => {
      items.push({ ...(doc.data() as Listing), id: doc.id });
    });
    // Sort by id or timestamp descending
    callback(items);
  }, (err) => {
    console.warn('Listing subscription error, fallback local:', err);
  });
}

/**
 * Real-time listener for seeker profiles
 */
export function subscribeToSeekers(callback: (seekers: SeekerProfile[]) => void) {
  const q = collection(db, SEEKERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: SeekerProfile[] = [];
    snapshot.forEach((doc) => {
      items.push({ ...(doc.data() as SeekerProfile), id: doc.id });
    });
    callback(items);
  }, (err) => {
    console.warn('Seeker subscription error, fallback local:', err);
  });
}

/**
 * Create or update listing in Firestore
 */
export async function saveListingToFirestore(listing: Listing): Promise<void> {
  const listingRef = doc(db, LISTINGS_COLLECTION, listing.id);
  await setDoc(listingRef, {
    ...listing,
    dbTimestamp: serverTimestamp(),
  });
}

/**
 * Save multiple listings in Firestore in parallel
 */
export async function saveMultipleListingsToFirestore(listings: Listing[]): Promise<void> {
  for (const listing of listings) {
    const listingRef = doc(db, LISTINGS_COLLECTION, listing.id);
    await setDoc(listingRef, {
      ...listing,
      dbTimestamp: serverTimestamp(),
    });
  }
}

/**
 * Create or update seeker profile in Firestore
 */
export async function saveSeekerToFirestore(seeker: SeekerProfile): Promise<void> {
  const seekerRef = doc(db, SEEKERS_COLLECTION, seeker.id);
  await setDoc(seekerRef, {
    ...seeker,
    dbTimestamp: serverTimestamp(),
  });
}

/**
 * Delete listing from Firestore
 */
export async function deleteListingFromFirestore(id: string): Promise<void> {
  const listingRef = doc(db, LISTINGS_COLLECTION, id);
  await deleteDoc(listingRef);
}

/**
 * Batch update or upsert listings in Firestore (using 400 chunk limits)
 */
export async function batchSaveListingsToFirestore(listings: Listing[]): Promise<number> {
  const chunkSize = 400;
  let count = 0;
  for (let i = 0; i < listings.length; i += chunkSize) {
    const chunk = listings.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const docRef = doc(db, LISTINGS_COLLECTION, item.id);
      batch.set(docRef, {
        ...item,
        dbTimestamp: serverTimestamp(),
      }, { merge: true });
      count++;
    }
    await batch.commit();
  }
  return count;
}

/**
 * Batch delete listings by IDs in Firestore
 */
export async function batchDeleteListingsFromFirestore(ids: string[]): Promise<number> {
  const chunkSize = 400;
  let count = 0;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const id of chunk) {
      const docRef = doc(db, LISTINGS_COLLECTION, id);
      batch.delete(docRef);
      count++;
    }
    await batch.commit();
  }
  return count;
}

/**
 * Restore and re-seed the full verified Milan catalog into Firestore
 */
export async function restoreDefaultCatalogToFirestore(): Promise<{ inserted: number; updated: number }> {
  const snap = await getDocs(collection(db, LISTINGS_COLLECTION));
  const existingIds = new Set(snap.docs.map(d => d.id));

  let inserted = 0;
  let updated = 0;

  const chunkSize = 400;
  for (let i = 0; i < INITIAL_LISTINGS.length; i += chunkSize) {
    const chunk = INITIAL_LISTINGS.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const item of chunk) {
      if (existingIds.has(item.id)) {
        updated++;
      } else {
        inserted++;
      }
      const docRef = doc(db, LISTINGS_COLLECTION, item.id);
      batch.set(docRef, {
        ...item,
        dbTimestamp: serverTimestamp(),
      }, { merge: true });
    }
    await batch.commit();
  }

  return { inserted, updated };
}

/**
 * Scans listings in Firestore and purges duplicate listings
 * based on same externalListingUrl or exact title + price + address match
 */
export async function purgeDuplicatesFromFirestore(): Promise<number> {
  const snap = await getDocs(collection(db, LISTINGS_COLLECTION));
  const seenUrls = new Set<string>();
  const seenSignatures = new Set<string>();
  const duplicateDocRefs: string[] = [];

  for (const document of snap.docs) {
    const data = document.data() as Listing;
    const url = data.externalListingUrl?.trim().toLowerCase();
    const signature = `${(data.title || '').trim().toLowerCase()}_${data.price}_${(data.zone || '').trim().toLowerCase()}`;

    if (url && url.length > 5) {
      if (seenUrls.has(url)) {
        duplicateDocRefs.push(document.id);
        continue;
      }
      seenUrls.add(url);
    }

    if (signature.length > 10) {
      if (seenSignatures.has(signature)) {
        duplicateDocRefs.push(document.id);
        continue;
      }
      seenSignatures.add(signature);
    }
  }

  if (duplicateDocRefs.length > 0) {
    await batchDeleteListingsFromFirestore(duplicateDocRefs);
  }

  return duplicateDocRefs.length;
}
