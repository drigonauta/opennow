
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function verifyRecentImports() {
    console.log("Fetching last 5 businesses...");
    const snapshot = await db.collection('business')
        .orderBy('created_at', 'desc')
        .limit(5)
        .get();

    if (snapshot.empty) {
        console.log("No businesses found.");
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log("---------------------------------------------------");
        console.log(`Name: ${data.name}`);
        console.log(`Location: ${data.city} - ${data.state}, ${data.country || 'N/A'}`);
        console.log(`Phone Field: ${data.phone || '(empty)'}`);
        console.log(`WhatsApp Field: ${data.whatsapp || '(empty)'}`);
        console.log(`Created At: ${new Date(data.created_at).toLocaleString()}`);
    });
}

verifyRecentImports().catch(console.error);
