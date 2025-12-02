
import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkData() {
    console.log('Fetching businesses...');
    const start = Date.now();
    try {
        const snapshot = await db.collection('business').get();
        const duration = Date.now() - start;
        console.log(`Fetched ${snapshot.size} businesses in ${duration}ms`);

        let missingCategory = 0;
        let nullCategory = 0;
        let otherCategory = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.category === undefined) missingCategory++;
            else if (data.category === null) nullCategory++;
            else if (data.category === 'Outros' || data.category === 'Other') otherCategory++;
        });

        console.log(`Missing Category: ${missingCategory}`);
        console.log(`Null Category: ${nullCategory}`);
        console.log(`"Outros" Category: ${otherCategory}`);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

checkData();
