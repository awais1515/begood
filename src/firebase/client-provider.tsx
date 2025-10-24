
'use client';
import {
  initializeFirebase,
  FirebaseProvider,
  type Firebase,
} from '@/firebase';
import { ReactNode, useEffect, useState } from 'react';

/**
 * Ensures that Firebase is initialized only once on the client, and provides
 * the Firebase services to its children.
 *
 * It is best used as a top-level provider in a client-side component tree.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<Firebase | null>(null);
  useEffect(() => {
    const firebase = initializeFirebase();
    setFirebase(firebase);
  }, []);
  if (!firebase) {
    return null;
  }
  return <FirebaseProvider firebase={firebase}>{children}</FirebaseProvider>;
}
