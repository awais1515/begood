
import { getFirebaseConfig } from './config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export * from './provider';
export * from './client-provider';

/**
 * Initializes Firebase and returns the app, auth, and firestore services.
 * It is idempotent, so it can be called multiple times without creating
 * new instances.
 */
export function initializeFirebase() {
  const firebaseConfig = getFirebaseConfig();
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  return { app, auth, firestore, storage };
}
