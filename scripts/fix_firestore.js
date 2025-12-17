import 'dotenv/config';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Admin SDK
// Tries to use default credentials (gcloud auth application-default login)
// which should work if running from the user's environment
if (!admin.apps.length) {
    // If we have a service account key file, we could use it, but default usually works in this env
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
}

const db = getFirestore();

async function fixFirestore() {
    console.log('🔥 Connecting to Firestore Project:', process.env.VITE_FIREBASE_PROJECT_ID);
    console.log('Scanning "business" collection for missing city/state...');

    try {
        const snapshot = await db.collection('business').get();
        if (snapshot.empty) {
            console.log('No businesses found.');
            return;
        }

        console.log(`Found ${snapshot.size} documents. Processing...`);

        let updatedCount = 0;
        let batch = db.batch();
        let batchCount = 0;
        const BATCH_SIZE = 400; // Limit is 500, playing safe

        for (const doc of snapshot.docs) {
            const b = doc.data();
            let needsUpdate = false;
            let updates = {};

            // Check if city/state is missing or clearly invalid (like numbers "15", "10" from previous bad script)
            // Or just check if we can parse better data

            // We only look at those with address
            if (b.address) {
                // If missing city/state OR if they look numeric (artifacts of bad split)
                const isMissing = !b.city || !b.state;
                const isSuspicious = !isNaN(Number(b.city)) || !isNaN(Number(b.state));

                if (isMissing || isSuspicious) {
                    const parts = b.address.split(',').map(p => p.trim());

                    if (parts.length >= 2) {
                        let found = false;
                        for (let i = parts.length - 1; i >= 0; i--) {
                            const part = parts[i];
                            // Regex for "City - ST"
                            const match = part.match(/^(.+?)\s+-\s+([A-Z]{2})$/);
                            if (match) {
                                const city = match[1].trim();
                                const state = match[2].trim();

                                if (city && state) {
                                    updates.city = city;
                                    updates.state = state;
                                    needsUpdate = true;
                                    found = true;
                                    // console.log(`Fixing ${b.name}: ${city}, ${state}`);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (needsUpdate) {
                batch.update(doc.ref, updates);
                batchCount++;
                updatedCount++;
            }

            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                console.log(`Commit batch of ${batchCount} updates...`);
                batch = db.batch();
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            console.log(`Commit final batch of ${batchCount} updates...`);
        }

        console.log(`✅ Successfully updated ${updatedCount} businesses in Firestore.`);

    } catch (error) {
        console.error('Error running fix:', error);
    }
}

fixFirestore().then(() => process.exit(0));
