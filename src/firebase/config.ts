
// This file is used by the Firebase CLI to initialize the Firebase project.
// It should not be modified.
import type { FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAqpvAtR5Gab7qawTThyR9afbHyFqT9nlM",
  authDomain: "begood-u4gke.firebaseapp.com",
  projectId: "begood-u4gke",
  storageBucket: "begood-u4gke.appspot.com",
  messagingSenderId: "999854436110",
  appId: "1:999854436110:web:e29cce9eb9c7abc743b15f",
};

export function getFirebaseConfig() {
  if (!firebaseConfig.apiKey) {
    throw new Error('Missing Firebase config: `apiKey`');
  }
  return firebaseConfig;
}
