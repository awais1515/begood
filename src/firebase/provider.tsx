
'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface Firebase {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

const FirebaseContext = createContext<Firebase | null>(null);

/**
 * Provides the Firebase services to its children.
 */
export function FirebaseProvider({
  firebase,
  children,
}: {
  firebase: Firebase;
  children: ReactNode;
}) {
  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function useFirebaseApp(): FirebaseApp {
  const firebase = useFirebase();
  if (!firebase) {
    throw new Error(
      'useFirebaseApp must be used within a FirebaseProvider.'
    );
  }
  return firebase.app;
}

export function useFirestore(): Firestore {
  const firebase = useFirebase();
  if (!firebase) {
    throw new Error(
      'useFirestore must be used within a FirebaseProvider.'
    );
  }
  return firebase.firestore;
}

/**
 * A hook that returns the user object from Firebase Authentication.
 * It also provides a loading state that is true while the user is being
 * authenticated, and false otherwise.
 *
 * This hook will automatically reload the page when the user's
 * authentication state changes.
 */
export function useAuth(): {
  user: User | null;
  loading: boolean;
  auth: Auth | null;
  storage: FirebaseStorage | null;
} {
  const firebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = firebase?.auth;
  const storage = firebase?.storage;

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, loading, auth, storage };
}
