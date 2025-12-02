import admin from 'firebase-admin';
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'micro-shoreline-479319-r2' // Hardcoded from deployment logs
});

const db = admin.firestore();

const CATEGORY_MAP = {
    'Food': 'Alimentação',
    'food': 'Alimentação',
    'Pharmacy': 'Farmácia',
    'pharmacy': 'Farmácia',
    'Services': 'Serviços',
    'services': 'Serviços',
    'Retail': 'Varejo',
    'retail': 'Varejo',
    'Health': 'Saúde',
    'health': 'Saúde',
    'Driver': 'Motorista',
    'driver': 'Motorista',
    'Delivery': 'Entregas',
    'delivery': 'Entregas',
    'Freelancer': 'Freelancer',
    'freelancer': 'Freelancer',
    'Other': 'Outros',
    'other': 'Outros',
    'Outros': 'Outros' // Ensure idempotency
};

async function migrateCategories() {
    console.log('Starting category migration...');
    const snapshot = await db.collection('business').get();

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    const batchSize = 500;
    let batch = db.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const currentCategory = data.category;

        if (!currentCategory) {
            console.log(`Skipping ${doc.id}: No category`);
            skipped++;
            continue;
        }

        const newCategory = CATEGORY_MAP[currentCategory] || CATEGORY_MAP[currentCategory.toLowerCase()] || currentCategory;

        if (newCategory !== currentCategory) {
            const docRef = db.collection('business').doc(doc.id);
            batch.update(docRef, { category: newCategory });
            updated++;
            count++;
        } else {
            skipped++;
        }

        if (count >= batchSize) {
            await batch.commit();
            batch = db.batch();
            count = 0;
            console.log(`Committed batch of ${batchSize} updates.`);
        }
    }

    if (count > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${count} updates.`);
    }

    console.log('Migration complete.');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${snapshot.size}`);
}

migrateCategories().catch(console.error);
