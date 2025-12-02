import fetch from 'node-fetch';

async function testImport() {
    console.log('🚀 Testing Google Maps Import...');

    // Mock request data
    const payload = {
        query: 'Padarias em Uberaba',
        lat: -19.747,
        lng: -47.939,
        radius: 1000
    };

    try {
        // Note: This requires the server to be running. 
        // In this environment, we might not be able to hit localhost:3001 if the server isn't started.
        // But this script serves as a template for the user or for us if we can start the server.
        const response = await fetch('http://localhost:3001/api/admin/import-google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dev-token'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ Import Test Passed!');
        } else {
            console.error('❌ Import Test Failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('Make sure the server is running on port 3001');
    }
}

testImport();
