import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 1. 👉 MAKE SURE THIS IMPORT IS AT THE TOP
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Diagnostic: log project ID so you can compare with server's FIREBASE_PROJECT_ID
if (import.meta.env.DEV) {
  console.log("[firebase] Client projectId:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. 👉 MAKE SURE THIS EXPORT IS AT THE BOTTOM
export const db = getFirestore(app);

export default app;