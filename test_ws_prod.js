import WebSocket from 'ws';
import fetch from 'node-fetch';

const WS_URL = 'wss://opennow-282091951030.us-central1.run.app';
const API_URL = 'https://opennow-282091951030.us-central1.run.app/api/admin/sync';
const TOKEN = 'admin-secret-token';

console.log(`Connecting to ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('✅ Connected to WebSocket');

    // Trigger Sync after 2 seconds
    setTimeout(async () => {
        console.log('Triggering Sync via API...');
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            const data = await res.json();
            console.log('API Response:', data);
        } catch (error) {
            console.error('API Error:', error);
        }
    }, 2000);
});

ws.on('message', (data) => {
    console.log('📩 Received Message:', data.toString());
    process.exit(0); // Success!
});

ws.on('error', (error) => {
    console.error('❌ WebSocket Error:', error);
    process.exit(1);
});

ws.on('close', () => {
    console.log('Disconnected');
});

// Timeout
setTimeout(() => {
    console.log('⏰ Timeout waiting for message');
    process.exit(1);
}, 10000);
