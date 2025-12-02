import fetch from 'node-fetch'; // Or use built-in fetch if Node 18+

const API_URL = 'http://localhost:3001/api/business/create';

const businesses = [
    {
        name: 'Pizzaria Sabor Mineiro',
        category: 'Food',
        description: 'A melhor pizza de Uberaba, feita no forno a lenha.',
        open_time: '18:00',
        close_time: '23:59',
        whatsapp: '5534999990001',
        latitude: -19.7475,
        longitude: -47.9395,
        owner_id: 'test_owner_1'
    },
    {
        name: 'Farmácia Saúde Total',
        category: 'Pharmacy',
        description: 'Medicamentos e perfumaria com o melhor preço.',
        open_time: '07:00',
        close_time: '22:00',
        whatsapp: '5534999990002',
        latitude: -19.7450,
        longitude: -47.9350,
        owner_id: 'test_owner_2'
    },
    {
        name: 'Auto Center Silva',
        category: 'Services',
        description: 'Mecânica geral, alinhamento e balanceamento.',
        open_time: '08:00',
        close_time: '18:00',
        whatsapp: '5534999990003',
        latitude: -19.7500,
        longitude: -47.9400,
        owner_id: 'test_owner_3'
    },
    {
        name: 'Mercado Preço Bom',
        category: 'Retail',
        description: 'Tudo para sua casa com economia.',
        open_time: '07:00',
        close_time: '20:00',
        whatsapp: '5534999990004',
        latitude: -19.7480,
        longitude: -47.9380,
        owner_id: 'test_owner_4'
    }
];

async function seed() {
    console.log('🌱 Seeding database...');

    for (const business of businesses) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(business)
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`✅ Created: ${business.name}`);
            } else {
                console.error(`❌ Failed to create ${business.name}:`, data);
            }
        } catch (error) {
            console.error(`❌ Error creating ${business.name}:`, error.message);
        }
    }

    console.log('✨ Seeding complete!');
}

seed();
