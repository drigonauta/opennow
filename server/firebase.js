import 'dotenv/config';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
// In Cloud Run, this automatically uses the default service account.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
    });
    console.log('🔥 Firebase Admin SDK Initialized on Server');
}

export const db = getFirestore();
export const auth = getAuth();
export default admin;
