
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyAqpvAtR5Gab7qawTThyR9afbHyFqT9nlM",
  authDomain: "begood-u4gke.firebaseapp.com",
  projectId: "begood-u4gke",
  storageBucket: "begood-u4gke.appspot.com",
  messagingSenderId: "999854436110",
  appId: "1:999854436110:web:e29cce9eb9c7abc743b15f",
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// App Check is temporarily disabled for debugging.
// let appCheckInstance: ReturnType<typeof initializeAppCheck> | undefined;

// // App Check: Initialize only on the client-side
// if (typeof window !== "undefined") {
//   appCheckInstance = initializeAppCheck(app, {
//     provider: new ReCaptchaEnterpriseProvider("6Lc9P4crAAAAAKXhpOBs6tYQTfZ7Kj4XXsK8xl9-"),
//     isTokenAutoRefreshEnabled: true,
//   });
// }

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
