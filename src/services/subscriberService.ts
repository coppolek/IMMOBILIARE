import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Subscriber, AppNotification, Newsletter, UserProfile, Listing } from '../types';

const SUBSCRIBERS_COLLECTION = 'subscribers';
const NOTIFICATIONS_COLLECTION = 'notifications';
const NEWSLETTERS_COLLECTION = 'newsletters';
const USERS_COLLECTION = 'users';

// Initial sample notification to seed if empty
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome-milan',
    title: 'Benvenuto su Affitti Milano Community!',
    message: 'Esplora oltre 75 alloggi verificati vicino alle principali università e metro. Riceverai qui gli avvisi sui nuovi alloggi disponibili.',
    type: 'system',
    targetAudience: 'all',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    authorName: 'Staff Affitti Milano',
  },
  {
    id: 'notif-lambrate-update',
    title: 'Nuovi alloggi verificati in zona Lambrate / Città Studi',
    message: 'Sono state appena caricate nuove stanze singole a partire da 550€ vicino al Politecnico di Milano Leonardo.',
    type: 'new_listing',
    targetAudience: 'all',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    authorName: 'Amministrazione',
  },
  {
    id: 'notif-scam-shield',
    title: 'Consigli Anti-Truffa per studenti e fuorisede',
    message: 'Non inviare mai caparre via bonifico prima di aver effettuato una visita o verificato il codice fiscale del locatore.',
    type: 'scam_alert',
    targetAudience: 'all',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    authorName: 'Scam Shield AI',
  }
];

// Initial sample newsletter to seed if empty
const INITIAL_NEWSLETTERS: Newsletter[] = [
  {
    id: 'nl-september-rush',
    subject: 'Guida Affitti Milano: Guida Rapida & Nuovi Alloggi Verificati',
    previewText: 'Le migliori stanze vicino a PoliMi, Statale e Bicocca selezionate dal nostro team.',
    content: `<h2>Ciao dai moderatori di Affitti Milano!</h2>
<p>La caccia alla stanza per il nuovo semestre universitario e lavorativo entra nel vivo. Questa settimana abbiamo verificato e aggiunto oltre 15 nuovi alloggi con contratto regolare e canone trasparente.</p>
<h3>Consigli della Settimana:</h3>
<ul>
  <li><strong>Contratto Transitorio Studenti:</strong> Richiedi sempre l'attestazione di canone concordato per le agevolazioni fiscali.</li>
  <li><strong>Spese Incluse:</strong> Controlla sempre se riscaldamento centralizzato e condominio sono compresi nel canone.</li>
</ul>
<p>Trovi tutti i nuovi alloggi direttamente sul portale web!</p>`,
    targetAudience: 'all',
    sentAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    sentBy: 'coppolek@gmail.com',
    recipientCount: 142,
    status: 'sent',
  }
];

/**
 * Seed initial sample notifications and newsletters if collections are empty
 */
export async function seedNotificationDataIfEmpty() {
  try {
    const notifSnap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
    if (notifSnap.empty) {
      const batch = writeBatch(db);
      for (const notif of INITIAL_NOTIFICATIONS) {
        const ref = doc(db, NOTIFICATIONS_COLLECTION, notif.id);
        batch.set(ref, {
          ...notif,
          dbTimestamp: serverTimestamp(),
        });
      }
      await batch.commit();
    }

    const nlSnap = await getDocs(collection(db, NEWSLETTERS_COLLECTION));
    if (nlSnap.empty) {
      const batch = writeBatch(db);
      for (const nl of INITIAL_NEWSLETTERS) {
        const ref = doc(db, NEWSLETTERS_COLLECTION, nl.id);
        batch.set(ref, {
          ...nl,
          dbTimestamp: serverTimestamp(),
        });
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Initial notifications/newsletter seed info:', err);
  }
}

// ----------------------------------------------------
// SUBSCRIBERS CRUD & REALTIME
// ----------------------------------------------------

export function subscribeToSubscribers(callback: (subscribers: Subscriber[]) => void) {
  const q = collection(db, SUBSCRIBERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const items: Subscriber[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...(docSnap.data() as Subscriber), id: docSnap.id });
    });
    // Sort descending by subscribedAt
    items.sort((a, b) => new Date(b.subscribedAt || 0).getTime() - new Date(a.subscribedAt || 0).getTime());
    callback(items);
  }, (err) => {
    console.warn('Subscribers subscription warning:', err);
  });
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  const q = collection(db, USERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const items: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...(docSnap.data() as UserProfile), uid: docSnap.id });
    });
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(items);
  }, (err) => {
    console.warn('Users subscription warning:', err);
  });
}

/**
 * Register or update a newsletter subscriber
 */
export async function addOrUpdateSubscriber(data: {
  email: string;
  name?: string;
  role?: string;
  preferredZones?: string[];
  maxBudget?: number;
  source?: Subscriber['source'];
}): Promise<Subscriber> {
  const cleanEmail = data.email.trim().toLowerCase();
  const safeId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const docRef = doc(db, SUBSCRIBERS_COLLECTION, safeId);

  const subscriber: Subscriber = {
    id: safeId,
    email: cleanEmail,
    name: data.name?.trim() || cleanEmail.split('@')[0],
    role: (data.role as any) || 'student',
    active: true,
    preferredZones: data.preferredZones || [],
    maxBudget: data.maxBudget || undefined,
    receiveNewListings: true,
    receiveWeeklyNewsletter: true,
    receiveAdminAlerts: true,
    subscribedAt: new Date().toISOString(),
    source: data.source || 'portal_footer',
  };

  await setDoc(docRef, {
    ...subscriber,
    dbTimestamp: serverTimestamp(),
  }, { merge: true });

  return subscriber;
}

export async function toggleSubscriberStatus(id: string, active: boolean): Promise<void> {
  const docRef = doc(db, SUBSCRIBERS_COLLECTION, id);
  await updateDoc(docRef, { active });
}

export async function deleteSubscriber(id: string): Promise<void> {
  const docRef = doc(db, SUBSCRIBERS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function updateUserRoleInAdmin(uid: string, role: string, isAdmin?: boolean): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
    role,
    ...(isAdmin !== undefined ? { isAdmin } : {}),
  });
}

export async function deleteUserFromAdmin(uid: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(docRef);
}

// ----------------------------------------------------
// IN-APP NOTIFICATIONS
// ----------------------------------------------------

export function subscribeToNotifications(callback: (notifications: AppNotification[]) => void) {
  const q = query(collection(db, NOTIFICATIONS_COLLECTION), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const items: AppNotification[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...(docSnap.data() as AppNotification), id: docSnap.id });
    });
    callback(items);
  }, (err) => {
    console.warn('Notifications subscription warning, fallback default:', err);
    // If index error or empty, try without orderBy
    const plainQ = collection(db, NOTIFICATIONS_COLLECTION);
    onSnapshot(plainQ, (s) => {
      const items: AppNotification[] = [];
      s.forEach(d => items.push({ ...(d.data() as AppNotification), id: d.id }));
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(items);
    });
  });
}

export async function sendAppNotification(data: {
  title: string;
  message: string;
  type: AppNotification['type'];
  targetAudience: AppNotification['targetAudience'];
  link?: string;
  listingId?: string;
  authorName?: string;
}): Promise<AppNotification> {
  const id = `notif-${Date.now()}`;
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);

  const newNotif: AppNotification = {
    id,
    title: data.title.trim(),
    message: data.message.trim(),
    type: data.type,
    targetAudience: data.targetAudience,
    link: data.link?.trim() || undefined,
    listingId: data.listingId?.trim() || undefined,
    createdAt: new Date().toISOString(),
    authorName: data.authorName || 'Amministrazione',
    readBy: [],
  };

  await setDoc(docRef, {
    ...newNotif,
    dbTimestamp: serverTimestamp(),
  });

  // Try to dispatch browser notification if permission granted
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotif.title, {
        body: newNotif.message,
        icon: '/favicon.ico',
      });
    }
  } catch (e) {
    // Benign
  }

  return newNotif;
}

export async function markNotificationAsRead(notificationId: string, userUid?: string): Promise<void> {
  // Store locally in localStorage for guests or anonymous users
  if (typeof window !== 'undefined') {
    try {
      const readSet = JSON.parse(localStorage.getItem('milan_read_notifications') || '[]');
      if (!readSet.includes(notificationId)) {
        readSet.push(notificationId);
        localStorage.setItem('milan_read_notifications', JSON.stringify(readSet));
      }
    } catch (e) {}
  }

  // Update in Firestore if user is logged in
  if (userUid) {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, {
        readBy: arrayUnion(userUid),
      });
    } catch (e) {
      // Ignored if permissions restrict
    }
  }
}

export async function deleteAppNotification(id: string): Promise<void> {
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    return false;
  }
}

// ----------------------------------------------------
// NEWSLETTERS
// ----------------------------------------------------

export function subscribeToNewsletters(callback: (newsletters: Newsletter[]) => void) {
  const q = collection(db, NEWSLETTERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const items: Newsletter[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...(docSnap.data() as Newsletter), id: docSnap.id });
    });
    items.sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());
    callback(items);
  }, (err) => {
    console.warn('Newsletters subscription warning:', err);
  });
}

export async function createAndSendNewsletter(params: {
  subject: string;
  previewText?: string;
  content: string;
  featuredListingIds?: string[];
  targetAudience: Newsletter['targetAudience'];
  sentBy: string;
  recipientCount: number;
}): Promise<Newsletter> {
  const id = `nl-${Date.now()}`;
  const docRef = doc(db, NEWSLETTERS_COLLECTION, id);

  const newsletter: Newsletter = {
    id,
    subject: params.subject.trim(),
    previewText: params.previewText?.trim(),
    content: params.content.trim(),
    featuredListingIds: params.featuredListingIds || [],
    targetAudience: params.targetAudience,
    sentAt: new Date().toISOString(),
    sentBy: params.sentBy,
    recipientCount: params.recipientCount,
    status: 'sent',
  };

  await setDoc(docRef, {
    ...newsletter,
    dbTimestamp: serverTimestamp(),
  });

  // Automatically broadcast an In-App notification corresponding to the newsletter
  await sendAppNotification({
    title: `Newsletter: ${newsletter.subject}`,
    message: newsletter.previewText || 'Una nuova newsletter con alloggi e novità è stata pubblicata!',
    type: 'newsletter',
    targetAudience: newsletter.targetAudience,
    authorName: 'Redazione Newsletter',
  });

  return newsletter;
}

export async function deleteNewsletter(id: string): Promise<void> {
  const docRef = doc(db, NEWSLETTERS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Generates responsive HTML email template for newsletter preview and dispatch
 */
export function generateEmailHtml(newsletter: Newsletter, listings: Listing[]): string {
  const featured = listings.filter(l => (newsletter.featuredListingIds || []).includes(l.id));

  const listingsHtml = featured.map(item => `
    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; margin-bottom: 16px; overflow: hidden; font-family: sans-serif;">
      ${item.photos && item.photos[0] ? `<img src="${item.photos[0]}" alt="${item.title}" style="width: 100%; height: 180px; object-fit: cover; display: block;" />` : ''}
      <div style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <span style="font-size: 18px; font-weight: bold; color: #78350f;">€${item.price}/mese</span>
          <span style="font-size: 12px; color: #57534e; text-transform: uppercase; font-weight: 600;">${item.roomType}</span>
        </div>
        <h4 style="margin: 0 0 6px 0; font-size: 16px; color: #1c1917;">${item.title}</h4>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #78716c;">Zona: ${item.zone} • Metro: ${item.metroStation || 'Milano'}</p>
        <p style="margin: 0; font-size: 13px; color: #44403c; line-height: 1.4;">${(item.description || '').slice(0, 120)}...</p>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${newsletter.subject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Affitti Milano Community</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Il portale trasparente per stanze e alloggi a Milano</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px; color: #292524; font-size: 15px; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1c1917; font-weight: 700;">${newsletter.subject}</h2>
              <div style="color: #44403c; margin-bottom: 24px;">
                ${newsletter.content.replace(/\n/g, '<br/>')}
              </div>

              ${featured.length > 0 ? `
                <div style="margin-top: 32px;">
                  <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1c1917; text-transform: uppercase; letter-spacing: 0.5px;">
                    🏠 Alloggi in Evidenza Questa Settimana:
                  </h3>
                  ${listingsHtml}
                </div>
              ` : ''}

              <!-- Call to Action button -->
              <div style="text-align: center; margin: 36px 0 20px 0;">
                <a href="https://ais-pre-p7y2rnfc66vckmju2htjyb-132736654569.europe-west3.run.app" 
                   style="background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">
                  Accedi a Tutti gli Annunci Online →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf9; border-top: 1px solid #e7e5e4; padding: 20px 24px; text-align: center; font-size: 12px; color: #78716c;">
              <p style="margin: 0 0 6px 0;">Ricevi questa email perché sei iscritto alla community di <strong>Affitti Milano</strong>.</p>
              <p style="margin: 0;">Milano, Italia • Gestisci o annulla l'iscrizione dalle impostazioni del tuo account sul sito.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
