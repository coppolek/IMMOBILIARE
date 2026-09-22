import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return await syncUserProfile(user);
}

export async function registerWithEmail(
  email: string, 
  pass: string, 
  displayName: string,
  role: UserRole = 'student'
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  if (displayName) {
    await updateProfile(user, { displayName });
  }

  return await syncUserProfile(user, { displayName, role });
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  return await syncUserProfile(user);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export const ADMIN_EMAILS = ['coppolek@gmail.com'];

export function isUserAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
  if (user.role === 'admin' || user.isAdmin === true) return true;
  return false;
}

/**
 * Ensures a UserProfile document exists in Firestore and returns the combined profile
 */
export async function syncUserProfile(user: User, extraData?: Partial<UserProfile>): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const emailIsAdmin = !!user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const defaultRole: UserRole = emailIsAdmin ? 'admin' : (extraData?.role || 'student');

  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      const isAdminFlag = emailIsAdmin || data.role === 'admin' || data.isAdmin === true;
      const finalRole = emailIsAdmin ? 'admin' : data.role || 'student';

      if (extraData && Object.keys(extraData).length > 0) {
        const merged = { ...data, ...extraData, isAdmin: isAdminFlag, role: finalRole };
        await setDoc(userDocRef, merged, { merge: true });
        return merged;
      }
      return { ...data, isAdmin: isAdminFlag, role: finalRole };
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: extraData?.displayName || user.displayName || (user.email ? user.email.split('@')[0] : 'Utente'),
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        role: defaultRole,
        isAdmin: emailIsAdmin,
        savedListingIds: [],
        createdAt: new Date().toISOString(),
        ...extraData,
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.warn('Sync user profile warning:', err);
    // Fallback in-memory profile if Firestore is restricted
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Utente'),
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      role: defaultRole,
      isAdmin: emailIsAdmin,
      savedListingIds: [],
      createdAt: new Date().toISOString(),
    };
  }
}

export async function updateUserRole(uid: string, role: UserRole, extra?: { university?: string; phone?: string; bio?: string }) {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, { role, ...extra }, { merge: true });
}

export async function toggleSaveListing(uid: string, listingId: string, isSaved: boolean) {
  const userDocRef = doc(db, 'users', uid);
  if (isSaved) {
    await updateDoc(userDocRef, {
      savedListingIds: arrayRemove(listingId)
    });
  } else {
    await updateDoc(userDocRef, {
      savedListingIds: arrayUnion(listingId)
    });
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await syncUserProfile(firebaseUser);
        callback(profile);
      } catch (e) {
        console.error('Error fetching user profile:', e);
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'student',
          savedListingIds: []
        });
      }
    } else {
      callback(null);
    }
  });
}

export function getAuthErrorMessage(code: string, isIt: boolean = true): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return isIt ? 'Credenziali non valide o email/password errata.' : 'Invalid credentials or wrong email/password.';
    case 'auth/email-already-in-use':
      return isIt ? 'Questa email è già registrata. Clicca su "Accedi".' : 'This email is already registered. Please log in.';
    case 'auth/weak-password':
      return isIt ? 'La password deve avere almeno 6 caratteri.' : 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return isIt ? 'Indirizzo email non valido.' : 'Invalid email address.';
    case 'auth/popup-closed-by-user':
      return isIt ? 'Accesso annullato: finestra popup chiusa.' : 'Login cancelled: popup window closed.';
    case 'auth/operation-not-allowed':
      return isIt 
        ? 'Accesso con email non ancora attivo. Usa il pulsante "Accedi con Google"!' 
        : 'Email/password is not enabled in Firebase. Please use "Sign in with Google"!';
    case 'auth/too-many-requests':
      return isIt ? 'Troppi tentativi falliti. Riprova tra poco.' : 'Too many failed attempts. Please try again later.';
    default:
      return isIt ? 'Si è verificato un errore durante l\'autenticazione.' : 'An error occurred during authentication.';
  }
}
