import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Environment variable configuration for Firebase (Vercel / Local .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAsqVcG4S01hMDiZJZpyCBcNY_sx43mf48',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'balingasag-local-tourism.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'balingasag-local-tourism',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'balingasag-local-tourism.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '725404935985',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:725404935985:web:22914dc5b4ece48828b210',
};

/**
 * Checks whether valid Firebase credentials have been configured.
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your-firebase-api-key' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your-firebase-project-id'
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.info('🔥 Firebase & Firestore initialized successfully for Discover Balingasag');
  } catch (error) {
    console.warn('Firebase initialization error, running in demo/offline mode:', error);
  }
} else {
  console.info(
    'ℹ️ Running in Demo / Free-Tier Standalone Mode. Add your Firebase credentials to .env to sync with live Cloud Firestore.'
  );
}

export { app, auth, db, firebaseConfig };
