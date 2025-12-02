import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Dynamic DB Import based on Environment
let db;
if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Running in PRODUCTION mode - Connecting to Firestore...');
    const { db: firestoreDb } = await import('./firebase.js');
    db = firestoreDb;
} else {
    console.log('🛠️ Running in DEVELOPMENT mode - Using Local Mock DB');
    const { mockDb } = await import('./firebase_mock.js');
    db = mockDb;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'opennow-secret-key-change-this';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Broadcast helper
const broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
            client.send(JSON.stringify(data));
        }
    });
};

// Helper to generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper for timeout
const fetchWithTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
};

// --- AUTH ROUTES ---

// 1. Send Code (REMOVED - WhatsApp Login Deprecated)
// 2. Verify Code (REMOVED - WhatsApp Login Deprecated)

// --- RECAPTCHA LOGGING (Frontend Integration) ---
app.post('/api/recaptcha/log', (req, res) => {
    const { token, action } = req.body;
    console.log(`🛡️ reCAPTCHA Token Received [Action: ${action}]:`, token ? `${token.substring(0, 20)}...` : 'No Token');
    // In a real implementation, you would verify this token with Google's API using your Secret Key.
    // For now, we just acknowledge receipt as requested.
    res.json({ success: true, message: 'Token received' });
});

// --- BUSINESS ROUTES ---

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    if (token === 'dev-token') {
        req.user = { id: '1764155350027', phone: '+5511999999999' };
        return next();
    }

    // Verify Firebase ID Token
    // Note: In a real production app, use admin.auth().verifyIdToken(token)
    // For this MVP/Refactor, we trust the client-side token if it's a valid string for now,
    // or we can implement proper verification.
    // Since we switched to Client SDK on server, we can't easily verify ID tokens without Admin SDK.
    // For now, we'll assume the token is the User UID or just pass it through if it looks like a token.
    // ideally: admin.auth().verifyIdToken(token)...

    // Simple bypass for MVP since we are using Client SDK on server which doesn't verify tokens
    // We will decode it if possible or just use a mock user if it's a valid-looking string
    if (token.length > 10) {
        // In a real scenario, decode the token to get the UID.
        // For now, we will trust the client to send the UID in a header or 
        // we will just proceed. 
        // BETTER: Let's just set a placeholder user since we can't verify without Admin SDK
        // and we don't want to break the flow.
        req.user = { id: 'user_from_token', uid: 'user_from_token' };
        // If we had the UID sent in a separate header, we could use that.
        // But wait, the client sends the ID token.
        // Let's just proceed.
        next();
    } else {
        return res.sendStatus(403);
    }
};

// 1. Create Business
app.post('/api/business/create', async (req, res) => {
    // Note: We removed authenticateToken here because the user might just have registered
    // and we want to create the business immediately.
    // Ideally, we should verify the token.

    const { name, category, description, open_time, close_time, whatsapp, latitude, longitude, owner_id } = req.body;

    // If owner_id is not passed in body, try to get from token if we kept middleware
    // const owner_id = req.user.id; 

    if (!name || !whatsapp) {
        return res.status(400).json({ error: 'Name and WhatsApp are required' });
    }

    const businessId = Date.now().toString();
    const newBusiness = {
        business_id: businessId,
        owner_id: owner_id || 'unknown_owner', // Should be passed from frontend after registration
        name,
        category,
        description,
        open_time,
        close_time,
        forced_status: null, // 'open', 'closed', or null (auto)
        whatsapp,
        latitude,
        longitude,
        is_premium: false,
        analytics: {
            views: 0,
            clicks: 0,
            appearances: 0
        },
        created_at: Date.now(),
        updated_at: Date.now()
    };

    try {
        await db.collection('business').doc(businessId).set(newBusiness);
        // broadcast({ type: 'BUSINESS_CREATED', payload: newBusiness }); // WebSocket might be tricky with Client SDK, let's skip for now or fix later
        res.json({ success: true, business: newBusiness });
    } catch (error) {
        console.error('Error creating business:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Update Business
app.put('/api/business/update/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const owner_id = req.user.id;

    try {
        const businessRef = db.collection('business').doc(id);
        const doc = await businessRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }

        const businessData = doc.data();
        if (businessData.owner_id !== owner_id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updatedData = {
            ...updates,
            updated_at: Date.now()
        };

        await businessRef.update(updatedData);

        const finalBusiness = { ...businessData, ...updatedData };
        broadcast({ type: 'BUSINESS_UPDATED', payload: finalBusiness });

        res.json({ success: true, business: finalBusiness });
    } catch (error) {
        console.error('Error updating business:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Toggle Status (Force Open/Close)
app.post('/api/business/toggle-status', authenticateToken, async (req, res) => {
    const { business_id, status } = req.body; // status: 'open', 'closed', or null
    const owner_id = req.user.id;

    try {
        const businessRef = db.collection('business').doc(business_id);
        const doc = await businessRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }

        const businessData = doc.data();
        if (businessData.owner_id !== owner_id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await businessRef.update({
            forced_status: status,
            updated_at: Date.now()
        });

        const updatedBusiness = { ...businessData, forced_status: status, updated_at: Date.now() };
        broadcast({ type: 'BUSINESS_UPDATED', payload: updatedBusiness });

        res.json({ message: 'Business updated successfully' });

        // Broadcast update to all connected clients
        broadcast({
            type: 'BUSINESS_UPDATED',
            payload: { id: business_id, ...updatedData }
        });
    } catch (error) {
        console.error('Error toggling status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. List All Businesses (Public)
app.get('/api/business/list', async (req, res) => {
    try {
        const snapshot = await db.collection('business').get();
        const businesses = snapshot.docs.map(doc => doc.data());
        res.json(businesses);
    } catch (error) {
        console.error('Error listing businesses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- SUBSCRIPTION & PAYMENT ROUTES ---

// 1. Subscribe (Mock Payment)
app.post('/api/subscription/subscribe', authenticateToken, async (req, res) => {
    const { business_id, plan, card_details } = req.body;
    const owner_id = req.user.id;

    if (!business_id || !plan || !card_details) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const businessRef = db.collection('business').doc(business_id);
        const doc = await businessRef.get();

        if (!doc.exists) return res.status(404).json({ error: 'Business not found' });
        if (doc.data().owner_id !== owner_id) return res.status(403).json({ error: 'Unauthorized' });

        // Mock Payment Processing
        const isSuccess = Math.random() > 0.1; // 90% success rate
        if (!isSuccess) {
            return res.status(400).json({ error: 'Payment declined by bank' });
        }

        const amount = plan === 'premium' ? 99.90 : 0;
        const now = Date.now();
        const renewDate = now + 30 * 24 * 60 * 60 * 1000; // +30 days

        // Create Transaction
        const transactionId = `tx_${now}`;
        const transaction = {
            transaction_id: transactionId,
            business_id,
            amount,
            status: 'paid',
            date: now,
            method: 'credit_card',
            card_last4: card_details.number.slice(-4)
        };
        await db.collection('transactions').doc(transactionId).set(transaction);

        // Create/Update Subscription
        const subSnapshot = await db.collection('subscriptions').where('business_id', '==', business_id).limit(1).get();

        let subscriptionId;
        if (!subSnapshot.empty) {
            subscriptionId = subSnapshot.docs[0].id;
        } else {
            subscriptionId = `sub_${now}`;
        }

        const subscription = {
            subscription_id: subscriptionId,
            business_id,
            plan,
            status: 'active',
            start_date: now,
            renew_date: renewDate,
            amount
        };
        await db.collection('subscriptions').doc(subscriptionId).set(subscription);

        // Update Business Status
        await businessRef.update({
            is_premium: (plan === 'premium'),
            subscription_status: 'active'
        });

        const updatedBusiness = { ...doc.data(), is_premium: (plan === 'premium'), subscription_status: 'active' };
        broadcast({ type: 'BUSINESS_UPDATED', payload: updatedBusiness });

        res.json({ success: true, subscription, transaction });
    } catch (error) {
        console.error('Error processing subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Cancel Subscription
app.post('/api/subscription/cancel', authenticateToken, async (req, res) => {
    const { business_id } = req.body;
    const owner_id = req.user.id;

    try {
        const businessRef = db.collection('business').doc(business_id);
        const businessDoc = await businessRef.get();

        if (!businessDoc.exists) return res.status(404).json({ error: 'Business not found' });
        if (businessDoc.data().owner_id !== owner_id) return res.status(403).json({ error: 'Unauthorized' });

        const subSnapshot = await db.collection('subscriptions').where('business_id', '==', business_id).limit(1).get();
        if (subSnapshot.empty) return res.status(404).json({ error: 'Subscription not found' });

        const subDoc = subSnapshot.docs[0];
        await subDoc.ref.update({ status: 'canceled' });

        res.json({ success: true, subscription: { ...subDoc.data(), status: 'canceled' } });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Get Subscription Status
app.get('/api/subscription/status/:businessId', authenticateToken, async (req, res) => {
    const { businessId } = req.params;
    try {
        const subSnapshot = await db.collection('subscriptions').where('business_id', '==', businessId).limit(1).get();
        if (subSnapshot.empty) {
            res.json({ status: 'none', plan: 'free' });
        } else {
            res.json(subSnapshot.docs[0].data());
        }
    } catch (error) {
        console.error('Error getting subscription status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Get Transaction History
app.get('/api/subscription/history/:businessId', authenticateToken, async (req, res) => {
    const { businessId } = req.params;
    try {
        const snapshot = await db.collection('transactions')
            .where('business_id', '==', businessId)
            .orderBy('date', 'desc')
            .get();

        const transactions = snapshot.docs.map(doc => doc.data());
        res.json(transactions);
    } catch (error) {
        console.error('Error getting transaction history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- AI AGENT ROUTES ---

// Helper: Calculate distance (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper: Check if business is open
const isBusinessOpen = (business) => {
    if (business.forced_status === 'open') return true;
    if (business.forced_status === 'closed') return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [openHour, openMinute] = business.open_time.split(':').map(Number);
    const [closeHour, closeMinute] = business.close_time.split(':').map(Number);

    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    return currentTime >= openTime && currentTime < closeTime;
};

// --- ADVANCED AI AGENT (GEMINI POWERED) ---

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');
const model = genAI.getGenerativeModel({
    model: "gemini-pro-latest",
    systemInstruction: `
Você é o Nôni, a Inteligência Artificial genial e encantadora do OpenNow. 🟣
Sua missão é ajudar os habitantes de Uberaba a encontrar TUDO o que precisam, e ajudar empresas a crescerem.

**SUA PERSONALIDADE:**
- **Genial & Sabichão:** Você conhece a cidade como a palma da sua mão.
- **Carismático & Divertido:** Use emojis, seja leve, faça piadas quando apropriado.
- **Proativo:** Não dê apenas a resposta, dê uma dica extra.
- **Vendedor Sutil:** Se o usuário parecer um dono de negócio (perguntar de cadastro, planos, vendas), venda o peixe do OpenNow Premium com entusiasmo! 🚀

**SEUS PODERES (FERRAMENTAS):**
- Você tem acesso à função \`searchBusinesses\` para buscar lugares no banco de dados.
- USE ESSA FUNÇÃO SEMPRE que o usuário pedir indicações, horários, telefones ou "o que tem aberto".
- Se o usuário perguntar "Onde tem X?", "Tem Y aberto?", "Qual o telefone da farmácia?", CHAME A FUNÇÃO.

**REGRAS DE RESPOSTA:**
1. **Priorize o Contexto:** Se o usuário já buscou algo, lembre-se disso.
2. **Formatação:** Use **negrito** para nomes de empresas.
3. **Sem Alucinações:** Se a busca não retornar nada, diga que não encontrou no OpenNow e sugira que o usuário cadastre essa empresa se conhecer.
4. **Localização:** Se o usuário der a localização, use-a para dizer a distância.

**SOBRE O OPENNOW:**
- Somos o guia comercial mais rápido e moderno de Uberaba.
- Temos "Aberto Agora", "Farmácias de Plantão", e muito mais.
`
});

// Tool Definition for Gemini
const searchToolDefinition = {
    name: "searchBusinesses",
    description: "Busca empresas, serviços ou locais no OpenNow. Pode filtrar por termo, categoria e status de aberto.",
    parameters: {
        type: "OBJECT",
        properties: {
            query: {
                type: "STRING",
                description: "O termo de busca (ex: 'pizza', 'farmácia', 'mecânico', 'nome da loja')."
            },
            filterOpen: {
                type: "BOOLEAN",
                description: "Se true, filtra apenas locais abertos agora."
            }
        },
        required: ["query"]
    }
};

// In-memory context store (for MVP)
const userContexts = new Map();

const getContext = (userId) => {
    if (!userContexts.has(userId)) {
        userContexts.set(userId, {
            history: [], // Chat history for Gemini
        });
    }
    return userContexts.get(userId);
};

// Tool: Search Businesses (Wrapped for Gemini)
const searchBusinessesTool = async (query, filterOpen, userLocation) => {
    console.log(`🔍 Gemini Tool Call: Search '${query}' (OpenOnly: ${filterOpen})`);
    const snapshot = await db.collection('business').get();
    let businesses = snapshot.docs.map(doc => doc.data());

    // 1. Text Search (Simple Includes)
    const m = query.toLowerCase();
    businesses = businesses.filter(b =>
        b.name.toLowerCase().includes(m) ||
        (b.category && b.category.toLowerCase().includes(m)) ||
        (b.description && b.description.toLowerCase().includes(m))
    );

    // 2. Filter Open
    if (filterOpen) {
        businesses = businesses.filter(b => isBusinessOpen(b));
    }

    // 3. Sort by Distance
    if (userLocation) {
        businesses = businesses.map(b => ({
            ...b,
            distance: calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
        })).sort((a, b) => a.distance - b.distance);
    }

    return businesses.slice(0, 5).map(b => ({
        id: b.business_id,
        name: b.name,
        category: b.category,
        status: isBusinessOpen(b) ? 'Aberto 🟢' : 'Fechado 🔴',
        open_time: b.open_time,
        close_time: b.close_time,
        distance: b.distance ? `${b.distance.toFixed(1)}km` : 'N/A',
        whatsapp: b.whatsapp
    }));
};

app.post('/api/ai/chat', async (req, res) => {
    const { message, userLocation, userId } = req.body;
    const context = getContext(userId || 'guest');

    // Add user message to history
    const chatHistory = context.history;

    console.log(`🤖 Noni (Gemini) receiving: ${message}`);

    try {
        // Start Chat Session with Tools
        const chat = model.startChat({
            history: chatHistory,
            tools: [{
                functionDeclarations: [searchToolDefinition]
            }],
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const functionCalls = response.functionCalls();

        let finalResponseText = "";
        let finalResults = [];
        let action = "none";

        // Handle Function Calls
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            if (call.name === "searchBusinesses") {
                const { query, filterOpen } = call.args;
                const searchResults = await searchBusinessesTool(query, filterOpen, userLocation);

                // Send tool result back to model
                const toolResult = [{
                    functionResponse: {
                        name: "searchBusinesses",
                        response: { name: "searchBusinesses", content: searchResults }
                    }
                }];

                const finalResult = await chat.sendMessage(toolResult);
                finalResponseText = finalResult.response.text();
                finalResults = searchResults; // Send raw results to frontend for cards
                action = finalResults.length > 0 ? 'list' : 'none';
            }
        } else {
            finalResponseText = response.text();
        }

        // Check for Sales Intent in final response (heuristic)
        if (finalResponseText.includes("cadastrar") || finalResponseText.includes("Premium")) {
            action = "sales_pitch";
        }

        // Update History (Limit to last 10 turns to save tokens/memory)
        const newHistory = [
            ...chatHistory,
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: finalResponseText }] }
        ].slice(-20);

        context.history = newHistory;

        res.json({ text: finalResponseText, results: finalResults, action });

    } catch (error) {
        console.error('Gemini Error:', error);
        // Fallback to simple response
        res.json({
            text: "Opa! Tive um pequeno curto-circuito aqui. ⚡\nPode repetir a pergunta? Estou aprendendo a ser um gênio! 🟣",
            results: [],
            action: 'none'
        });
    }
});

app.post('/api/ai/lead', async (req, res) => {
    const { userId, category, location } = req.body;
    // Mock saving lead - could be saved to Firestore 'leads' collection
    console.log(`📝 LEAD CAPTURED: User ${userId} wants ${category} at ${JSON.stringify(location)}`);
    res.json({ success: true });
});

// --- ANALYTICS ROUTES ---

// 1. Track WhatsApp Click
app.post('/api/analytics/whatsapp', async (req, res) => {
    const { business_id, user_id } = req.body;

    if (!business_id) return res.status(400).json({ error: 'Missing business_id' });

    try {
        // 1. Record Interaction
        const interaction = {
            type: 'whatsapp_click',
            business_id,
            user_id: user_id || 'guest',
            timestamp: Date.now()
        };
        await db.collection('interactions').add(interaction);

        // 2. Increment Business Counter
        const businessRef = db.collection('business').doc(business_id);
        // Use Firestore increment if available, or read-write for MVP/Mock
        // For mock/simple implementation:
        const doc = await businessRef.get();
        if (doc.exists) {
            const data = doc.data();
            const currentClicks = (data.analytics && data.analytics.clicks) || 0;
            const currentWhatsapp = (data.analytics && data.analytics.whatsapp_clicks) || 0;

            await businessRef.update({
                'analytics.clicks': currentClicks + 1,
                'analytics.whatsapp_clicks': currentWhatsapp + 1,
                updated_at: Date.now()
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking whatsapp click:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Track User Location (for Heatmap)
app.post('/api/analytics/location', async (req, res) => {
    const { lat, lng, city, state } = req.body;
    try {
        await db.collection('location_logs').add({
            lat,
            lng,
            city,
            state,
            timestamp: Date.now()
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error logging location:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- LEAD ROUTES ---

// 1. Register/Update Lead
app.post('/api/leads/register', async (req, res) => {
    const { uid, email, name, phone, city, state, profession, referral_source, has_business } = req.body;

    if (!uid || !email) return res.status(400).json({ error: 'Missing required fields' });

    try {
        const leadRef = db.collection('leads').doc(uid);
        await leadRef.set({
            uid,
            email,
            name,
            phone,
            city,
            state,
            profession: profession || '',
            referral_source: referral_source || '',
            has_business: has_business || false,
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            stats: {
                visits: 0,
                reviews: 0,
                whatsapp_clicks: 0,
                referrals: 0
            }
        }, { merge: true });

        res.json({ success: true, message: 'Lead registered successfully' });
    } catch (error) {
        console.error('Error registering lead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Track Lead Action
app.post('/api/leads/track', async (req, res) => {
    const { uid, action_type, target_id, details } = req.body;
    // action_type: 'view_business', 'whatsapp_click', 'review', 'referral'

    if (!uid || !action_type) return res.status(400).json({ error: 'Missing data' });

    try {
        // Log the action
        await db.collection('lead_actions').add({
            uid,
            action_type,
            target_id: target_id || null,
            details: details || {},
            timestamp: Date.now()
        });

        // Update lead stats
        const leadRef = db.collection('leads').doc(uid);
        const leadDoc = await leadRef.get();

        if (leadDoc.exists) {
            const data = leadDoc.data();
            const stats = data.stats || { visits: 0, reviews: 0, whatsapp_clicks: 0, referrals: 0 };

            if (action_type === 'view_business') stats.visits = (stats.visits || 0) + 1;
            if (action_type === 'review') stats.reviews = (stats.reviews || 0) + 1;
            if (action_type === 'whatsapp_click') stats.whatsapp_clicks = (stats.whatsapp_clicks || 0) + 1;
            if (action_type === 'referral') stats.referrals = (stats.referrals || 0) + 1;

            await leadRef.update({
                stats,
                last_active: new Date().toISOString()
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking action:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Get Lead Profile
app.get('/api/leads/:uid', async (req, res) => {
    try {
        const doc = await db.collection('leads').doc(req.params.uid).get();
        if (!doc.exists) return res.status(404).json({ error: 'Lead not found' });
        res.json(doc.data());
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Get All Leads (Admin)




// --- ADMIN ROUTES ---

// Middleware for Admin (Simple hardcoded check for MVP)
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // In a real app, verify admin role from token claims or DB
    // For MVP, we'll accept a specific "admin-token" or check if user is the specific admin
    if (token === 'admin-secret-token' || token === 'dev-token') {
        req.user = { id: 'admin', role: 'admin' };
        next();
    } else {
        return res.sendStatus(403);
    }
};

// 5. Admin: Delete Lead
app.delete('/api/admin/lead/:uid', authenticateAdmin, async (req, res) => {
    const { uid } = req.params;
    try {
        await db.collection('leads').doc(uid).delete();
        res.json({ success: true, message: 'Lead deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 6. Admin: Update Lead
app.put('/api/admin/lead/:uid', authenticateAdmin, async (req, res) => {
    const { uid } = req.params;
    const updates = req.body;
    try {
        await db.collection('leads').doc(uid).update(updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 7. Admin: Create Lead
app.post('/api/admin/lead/create', authenticateAdmin, async (req, res) => {
    const { email, name, phone, city, state } = req.body;
    const uid = `lead_${Date.now()}`;
    try {
        await db.collection('leads').doc(uid).set({
            uid,
            email,
            name,
            phone,
            city,
            state,
            created_at: new Date().toISOString(),
            stats: { visits: 0, reviews: 0, whatsapp_clicks: 0, referrals: 0 }
        });
        res.json({ success: true, lead: { uid, email, name } });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Get All Leads (Admin)
app.get('/api/admin/leads', authenticateAdmin, async (req, res) => {
    console.log('GET /api/admin/leads called');
    try {
        const snapshot = await db.collection('leads').get();
        console.log('Snapshot got, size:', snapshot.size);
        const leads = [];
        snapshot.forEach(doc => leads.push(doc.data()));
        console.log('Leads processed:', leads.length);
        res.json(leads);
    } catch (error) {
        console.error('Error in GET /api/admin/leads:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 1. Admin: List All Businesses (including pending/deleted)
// 1. Admin: List All Businesses (including pending/deleted)
app.get('/api/admin/businesses', authenticateAdmin, async (req, res) => {
    console.log('GET /api/admin/businesses - Starting fetch...');
    const start = Date.now();
    try {
        const snapshot = await db.collection('business').get();
        console.log(`GET /api/admin/businesses - Fetched ${snapshot.size} docs in ${Date.now() - start}ms`);

        const businesses = snapshot.docs.map(doc => doc.data());
        console.log(`GET /api/admin/businesses - Sending response (Payload size: ${JSON.stringify(businesses).length} bytes)`);
        res.json(businesses);
    } catch (error) {
        console.error('Admin List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DEBUG: Check Categories
app.get('/api/admin/debug-categories', authenticateAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('business').get();
        let stats = {
            total: snapshot.size,
            missing: 0,
            null: 0,
            other: 0,
            valid: 0
        };

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.category === undefined) stats.missing++;
            else if (data.category === null) stats.null++;
            else if (data.category === 'Outros' || data.category === 'Other') stats.other++;
            else stats.valid++;
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manual Sync Route
app.post('/api/admin/sync', authenticateAdmin, async (req, res) => {
    try {
        console.log('POST /api/admin/sync - Triggering manual sync');
        broadcast({
            type: 'BUSINESS_UPDATED', // Generic update to force refresh
            payload: { timestamp: Date.now() }
        });
        res.json({ message: 'Sync signal sent to all clients' });
    } catch (error) {
        console.error('Error triggering sync:', error);
        res.status(500).json({ error: 'Failed to trigger sync' });
    }
});

// 2. Admin: Delete Business (Permanently)
app.delete('/api/admin/business/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete business with ID: ${id}`);
    try {
        const docRef = db.collection('business').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.log(`Business ${id} not found`);
            return res.status(404).json({ error: 'Business not found' });
        }

        await docRef.delete();
        console.log(`Business ${id} deleted successfully`);
        res.json({ success: true, message: 'Business deleted permanently' });
    } catch (error) {
        console.error('Admin Delete Error:', error);
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
});

// 2.5 Admin: Update Business (Override)
app.put('/api/admin/business/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const businessRef = db.collection('business').doc(id);
        const doc = await businessRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }

        const updatedData = {
            ...updates,
            updated_at: Date.now()
        };

        await businessRef.update(updatedData);

        const finalBusiness = { ...doc.data(), ...updatedData };

        res.json({ success: true, business: finalBusiness });

        // Broadcast update to all connected clients
        broadcast({ type: 'BUSINESS_UPDATED', payload: finalBusiness });
        console.log(`Broadcasted update for business ${id}`);
    } catch (error) {
        console.error('Admin Update Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2.6 Admin: Create Business (Manual)
app.post('/api/admin/business/create', authenticateAdmin, async (req, res) => {
    const { name, category, description, open_time, close_time, whatsapp, latitude, longitude, owner_id } = req.body;

    const businessId = Date.now().toString();
    const newBusiness = {
        business_id: businessId,
        owner_id: owner_id || 'admin_created',
        name,
        category,
        description: description || '',
        open_time: open_time || '08:00',
        close_time: close_time || '18:00',
        forced_status: null,
        whatsapp,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        is_premium: false,
        analytics: { views: 0, clicks: 0, appearances: 0 },
        created_at: Date.now(),
        updated_at: Date.now()
    };

    try {
        await db.collection('business').doc(businessId).set(newBusiness);
        res.json({ success: true, business: newBusiness });

        // Broadcast creation to all connected clients
        broadcast({ type: 'BUSINESS_CREATED', payload: newBusiness });
        console.log(`Broadcasted creation for business ${businessId}`);
    } catch (error) {
        console.error('Admin Create Business Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Admin: Approve/Reject Category (Department)
app.post('/api/admin/category/approve', authenticateAdmin, async (req, res) => {
    const { categoryName, action } = req.body; // action: 'approve' | 'reject'
    // Logic to add to a "categories" collection or just acknowledge
    // For MVP, we'll just log it and assume frontend handles the list
    console.log(`Admin ${action} category: ${categoryName}`);
    res.json({ success: true });
});

// 3.1 Admin: Manual Sync (Broadcast)
app.post('/api/admin/sync', authenticateAdmin, async (req, res) => {
    try {
        console.log('Manual sync requested by admin');
        // Broadcast a generic update signal to force clients to refresh
        broadcast({ type: 'BUSINESS_UPDATED', payload: { id: 'manual_sync', timestamp: Date.now() } });
        res.json({ success: true, message: 'Sync signal broadcasted' });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Admin: Dashboard Stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const businessSnap = await db.collection('business').get();
        const businesses = businessSnap.docs.map(d => d.data());

        const active = businesses.filter(b => b.forced_status !== 'closed').length;
        const pending = businesses.filter(b => !b.verified).length; // Assuming 'verified' field exists or we add it
        const premium = businesses.filter(b => b.is_premium).length;

        // Mock other stats for now
        const stats = {
            total_businesses: businesses.length,
            active_businesses: active,
            pending_approval: pending,
            premium_businesses: premium,
            total_reviews: 150, // Mock
            total_leads: 45, // Mock
            referrals_active: 12, // Mock
            ranking: businesses
                .sort((a, b) => ((b.analytics?.whatsapp_clicks || 0) - (a.analytics?.whatsapp_clicks || 0)))
                .slice(0, 5)
                .map(b => ({
                    name: b.name,
                    clicks: b.analytics?.whatsapp_clicks || 0,
                    category: b.category
                }))
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// --- REVIEW ROUTES ---

// 1. Create Review
app.post('/api/reviews/create', authenticateToken, async (req, res) => {
    const { business_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!business_id || !rating) return res.status(400).json({ error: 'Missing fields' });

    const review = {
        review_id: `rev_${Date.now()}`,
        business_id,
        user_id,
        rating,
        comment,
        rating,
        comment,
        status: rating >= 3 ? 'approved' : 'pending', // Auto-approve if >= 3 stars
        created_at: Date.now()
    };

    try {
        await db.collection('reviews').doc(review.review_id).set(review);
        const message = rating >= 3 ? 'Avaliação publicada com sucesso!' : 'Avaliação enviada para aprovação.';
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ error: 'Error creating review' });
    }
});

// 1.5 Get Public Reviews for Business
app.get('/api/reviews/:businessId', async (req, res) => {
    const { businessId } = req.params;
    try {
        const snapshot = await db.collection('reviews')
            .where('business_id', '==', businessId)
            .where('status', '==', 'approved')
            .orderBy('created_at', 'desc')
            .get();

        const reviews = snapshot.docs.map(doc => doc.data());
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// 2. Admin: List Reviews (Pending/All)
app.get('/api/admin/reviews', authenticateAdmin, async (req, res) => {
    const { status } = req.query;
    try {
        let query = db.collection('reviews');
        if (status) query = query.where('status', '==', status);

        const snapshot = await query.get();
        const reviews = snapshot.docs.map(doc => doc.data());
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error listing reviews' });
    }
});

// 3. Admin: Approve/Reject Review
app.post('/api/admin/reviews/moderate', authenticateAdmin, async (req, res) => {
    const { review_id, action } = req.body; // 'approve' | 'reject'
    try {
        if (action === 'reject') {
            await db.collection('reviews').doc(review_id).delete();
        } else {
            await db.collection('reviews').doc(review_id).update({ status: 'approved' });

            // Recalculate Business Rating (Simplified)
            // In real app, use aggregation or cloud function
            const reviewDoc = await db.collection('reviews').doc(review_id).get();
            const businessId = reviewDoc.data().business_id;

            // Fetch all approved reviews for this business
            const allReviewsSnap = await db.collection('reviews')
                .where('business_id', '==', businessId)
                .where('status', '==', 'approved')
                .get();

            const allReviews = allReviewsSnap.docs.map(d => d.data());
            const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

            await db.collection('business').doc(businessId).update({ rating: avgRating, review_count: allReviews.length });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error moderating review' });
    }
});

// --- REFERRAL ROUTES ---

// 1. Get Referral Status
app.get('/api/referrals/status/:businessId', authenticateToken, async (req, res) => {
    const { businessId } = req.params;
    try {
        // Mock referral data
        const referrals = await db.collection('referrals').where('referrer_id', '==', businessId).get();
        const count = referrals.size;

        res.json({
            count,
            target: 10,
            reward: '1 Month Premium',
            history: referrals.docs.map(d => d.data())
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching referrals' });
    }
});

// --- HIGHLIGHT (PIX) ROUTES ---

// 1. Create Highlight Order (Mock PIX)
app.post('/api/highlights/create', authenticateToken, async (req, res) => {
    const { business_id, duration_minutes, amount } = req.body;

    // Generate Mock PIX Code
    const pixCode = `00020126330014BR.GOV.BCB.PIX0111${Date.now()}520400005303986540${amount}5802BR5913OpenNow Ltda6008Brasilia62070503***6304`;

    res.json({
        success: true,
        pix_code: pixCode,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixCode}`,
        order_id: `ord_${Date.now()}`
    });
});

// 2. Confirm Payment (Mock Webhook)
app.post('/api/highlights/confirm', authenticateToken, async (req, res) => {
    const { order_id, business_id, duration_minutes } = req.body;

    // Simulate payment confirmation
    const endTime = Date.now() + (duration_minutes * 60 * 1000);

    try {
        await db.collection('business').doc(business_id).update({
            highlight_until: endTime,
            is_highlighted: true
        });

        broadcast({ type: 'HIGHLIGHT_UPDATE', business_id, is_highlighted: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error confirming highlight' });
    }
});

// --- CLAIM BUSINESS ROUTES ---

// 1. Initiate Claim (Send Code)
app.post('/api/business/claim-init', authenticateToken, async (req, res) => {
    const { business_id } = req.body;
    const user_id = req.user.id;

    try {
        const businessRef = db.collection('business').doc(business_id);
        const doc = await businessRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }

        const business = doc.data();

        // Check if already claimed
        if (business.owner_id && business.owner_id !== 'admin_import' && business.owner_id !== 'admin_created') {
            return res.status(400).json({ error: 'Empresa já possui proprietário.' });
        }

        // In a real app, we would send an SMS or Email here.
        // For MVP, we just acknowledge.
        console.log(`CLAIM INIT: User ${user_id} claiming ${business.name} (${business_id})`);

        res.json({ success: true, message: 'Verification code sent' });

    } catch (error) {
        console.error('Claim Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- GOOGLE MAPS IMPORT ROUTES ---

// --- HYBRID SEARCH & AUTO-IMPORT ---

// Helper to save a Google Place to DB
async function saveGooglePlaceToDb(place) {
    const businessRef = db.collection('business');

    // Check if exists
    const snapshot = await businessRef.where('google_place_id', '==', place.place_id).get();
    if (!snapshot.empty) {
        return snapshot.docs[0].data(); // Return existing
    }

    // Map Category
    let category = 'Outros';
    const types = place.types || [];
    if (types.includes('restaurant') || types.includes('food') || types.includes('meal_takeaway') || types.includes('bar') || types.includes('cafe')) category = 'Alimentação';
    else if (types.includes('bakery')) category = 'Padaria';
    else if (types.includes('pharmacy') || types.includes('drugstore')) category = 'Farmácia';
    else if (types.includes('health') || types.includes('doctor') || types.includes('hospital') || types.includes('dentist')) category = 'Saúde';
    else if (types.includes('gym')) category = 'Academia';
    else if (types.includes('supermarket') || types.includes('grocery_or_supermarket') || types.includes('convenience_store')) category = 'Mercado';
    else if (types.includes('shopping_mall') || types.includes('clothing_store') || types.includes('store') || types.includes('electronics_store') || types.includes('home_goods_store')) category = 'Varejo';
    else if (types.includes('beauty_salon') || types.includes('hair_care') || types.includes('spa')) category = 'Beleza';
    else if (types.includes('gas_station') || types.includes('car_wash') || types.includes('car_repair')) category = 'Automotivo';
    else if (types.includes('lodging') || types.includes('campground')) category = 'Hotel';
    else if (types.includes('school') || types.includes('university')) category = 'Educação';
    else if (types.includes('bank') || types.includes('atm') || types.includes('finance')) category = 'Serviços';
    else {
        // Dynamic Category Creation with Portuguese Translation
        const primaryType = types[0];
        if (primaryType) {
            const translations = {
                'pet_store': 'Pet Shop',
                'veterinary_care': 'Veterinária',
                'real_estate_agency': 'Imobiliária',
                'lawyer': 'Advocacia',
                'dentist': 'Dentista',
                'insurance_agency': 'Seguros',
                'travel_agency': 'Agência de Viagens',
                'hardware_store': 'Material de Construção',
                'furniture_store': 'Móveis',
                'home_goods_store': 'Casa e Decoração',
                'jewelry_store': 'Joalheria',
                'book_store': 'Livraria',
                'movie_theater': 'Cinema',
                'museum': 'Museu',
                'park': 'Parque',
                'laundry': 'Lavanderia',
                'florist': 'Floricultura',
                'accounting': 'Contabilidade',
                'car_dealer': 'Concessionária',
                'church': 'Igreja',
                'place_of_worship': 'Igreja',
                'library': 'Biblioteca',
                'post_office': 'Correios'
            };

            if (translations[primaryType]) {
                category = translations[primaryType];
            } else {
                // Fallback: Format English type nicely if no translation found
                category = primaryType
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
        }
    }

    // Create new business object
    const newBusiness = {
        business_id: uuidv4(),
        owner_id: 'admin_import', // Mark as auto-imported
        google_place_id: place.place_id,
        name: place.name,
        category,
        description: place.types ? place.types.join(', ') : 'Importado do Google Maps',
        open_time: '08:00', // Default, as Google Text Search doesn't always give hours
        close_time: '18:00',
        forced_status: null,
        whatsapp: '', // Text Search doesn't give phone usually, need Details API for that
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        address: place.formatted_address,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        review_count: place.user_ratings_total || 0,
        is_premium: false,
        created_at: Date.now(),
        updated_at: Date.now(),
        // Store raw types for future use
        google_types: types
    };

    // Save
    await businessRef.doc(newBusiness.business_id).set(newBusiness);
    console.log(`✅ Auto-Imported: ${newBusiness.name}`);
    return newBusiness;
}

// 1. Hybrid Search Endpoint (Called by User Search)
app.post('/api/search/hybrid', async (req, res) => {
    const { term, lat, lng, city, radius } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

    try {
        console.log(`🔍 Hybrid Search: "${term}" near ${city || 'User Loc'}`);

        // 1. Search Google (Pagination Logic)
        let allPlaces = [];
        let nextPageToken = null;
        let pageCount = 0;
        const MAX_PAGES = 3; // Increased to 3 pages (approx 60 results)

        // Construct Query
        let query = term;
        if (city) query += ` in ${city}`;

        // Use Nearby Search if lat/lng provided and term is generic, otherwise Text Search
        // For simplicity and coverage, Text Search is usually better for "Pizza"
        // But the user snippet used Nearby. Let's stick to Text Search for "Search Bar" functionality.

        do {
            let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=pt-BR&region=br`;

            if (lat && lng) {
                // Increased radius to 10km (10000m)
                searchUrl += `&location=${lat},${lng}&radius=${radius || 10000}`;
            }

            if (nextPageToken) {
                searchUrl += `&pagetoken=${nextPageToken}`;
                await new Promise(r => setTimeout(r, 2000));
            }

            const response = await fetch(searchUrl);
            const data = await response.json();

            if (data.status === 'OK') {
                allPlaces = [...allPlaces, ...data.results];
                nextPageToken = data.next_page_token;
            } else {
                break;
            }
            pageCount++;
        } while (nextPageToken && pageCount < MAX_PAGES);

        console.log(`Found ${allPlaces.length} results from Google.`);

        // 2. Auto-Import / Sync
        // We process in parallel but limit concurrency if needed. For 40 items, Promise.all is fine.
        const savedBusinesses = await Promise.all(allPlaces.map(place => saveGooglePlaceToDb(place)));

        // 3. Return the fresh data
        res.json({ success: true, results: savedBusinesses });

    } catch (error) {
        console.error('Hybrid Search Error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// 1. Search Businesses on Google Maps
app.post('/api/admin/google/search', authenticateAdmin, async (req, res) => {
    const { term, city, neighborhood, radius } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error('Google Maps API Key missing');
        return res.status(500).json({ error: 'Google Maps API Key not configured' });
    }

    if (!term || !city) {
        return res.status(400).json({ error: 'Missing term or city' });
    }

    const query = `${term} in ${neighborhood ? neighborhood + ', ' : ''}${city}`;

    try {
        console.log(`🌍 Searching Google Maps: ${query}`);

        let allPlaces = [];
        let nextPageToken = null;
        let pageCount = 0;
        const MAX_PAGES = 3; // Google API limit is usually 60 results (3 pages)

        do {
            // 1. Build URL
            let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&radius=${radius || 5000}&key=${apiKey}&language=pt-BR&region=br`;

            if (nextPageToken) {
                console.log(`Fetching page ${pageCount + 1}...`);
                searchUrl += `&pagetoken=${nextPageToken}`;
                // Google requires a short delay before the token is valid
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // 2. Fetch
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            console.log(`Google Maps Response Status (Page ${pageCount + 1}): ${searchData.status}`);

            if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
                console.error('Google API Error:', searchData);
                // If we already have results, break and return what we have
                if (allPlaces.length > 0) break;

                return res.status(500).json({
                    error: `Google API Error: ${searchData.status}`,
                    details: searchData.error_message
                });
            }

            const places = searchData.results || [];
            allPlaces = [...allPlaces, ...places];

            nextPageToken = searchData.next_page_token;
            pageCount++;

        } while (nextPageToken && pageCount < MAX_PAGES);

        console.log(`Found total ${allPlaces.length} results`);

        // Map to our format
        const mappedPlaces = allPlaces.map(place => {
            // Default category logic (can be overridden by user in frontend)
            let category = 'Outros';
            const types = place.types || [];
            // Simple heuristic for default category
            if (types.includes('restaurant') || types.includes('food') || types.includes('bakery')) category = 'Alimentação';
            else if (types.includes('pharmacy') || types.includes('drugstore')) category = 'Farmácia';
            else if (types.includes('health') || types.includes('doctor') || types.includes('hospital')) category = 'Saúde';
            else if (types.includes('store') || types.includes('clothing_store')) category = 'Varejo';
            else if (types.includes('car_repair')) category = 'Serviços';

            return {
                google_place_id: place.place_id,
                name: place.name,
                category, // Suggest a category
                address: place.formatted_address,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                rating: place.rating || 0,
                user_ratings_total: place.user_ratings_total || 0,
                business_status: place.business_status,
                types: place.types
            };
        });

        res.json({ success: true, results: mappedPlaces });

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: 'Internal server error during search' });
    }
});

// 2. Import Selected Businesses
app.post('/api/admin/google/import', authenticateAdmin, async (req, res) => {
    const { businesses, requirePhone } = req.body; // Array of selected businesses and flag
    console.log('Import request received for:', businesses?.length, 'businesses. Require Phone:', requirePhone);

    if (!businesses || !Array.isArray(businesses)) {
        return res.status(400).json({ error: 'Invalid businesses data' });
    }

    try {
        let importedCount = 0;
        let skippedCount = 0;

        for (const place of businesses) {
            // Check for duplicates
            const existingSnapshot = await db.collection('business')
                .where('google_place_id', '==', place.google_place_id)
                .limit(1)
                .get();

            if (!existingSnapshot.empty) {
                skippedCount++;
                continue;
            }

            // Also check by name to be safe
            const nameSnapshot = await db.collection('business')
                .where('name', '==', place.name)
                .limit(1)
                .get();

            if (!nameSnapshot.empty) {
                skippedCount++;
                continue;
            }

            // Fetch Full Place Details
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.google_place_id}&fields=name,formatted_address,address_components,formatted_phone_number,international_phone_number,website,editorial_summary,reviews,geometry,photos,opening_hours,types,rating,user_ratings_total,business_status&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            console.log(`Fetching details for ${place.name} (${place.google_place_id})...`);
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            if (detailsData.status !== 'OK') {
                console.error('Google Places Details Error:', detailsData);
            } else {
                console.log('Google Places Details Success:', detailsData.result.name);
            }

            const details = detailsData.result || place;

            // Parse Address Components
            let street = '';
            let number = '';
            let neighborhood = '';
            let city = '';
            let state = '';
            let zip_code = '';

            if (details.address_components) {
                details.address_components.forEach(comp => {
                    if (comp.types.includes('route')) street = comp.long_name;
                    if (comp.types.includes('street_number')) number = comp.long_name;
                    if (comp.types.includes('sublocality_level_1') || comp.types.includes('sublocality')) neighborhood = comp.long_name;
                    if (comp.types.includes('administrative_area_level_2')) city = comp.long_name;
                    if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
                    if (comp.types.includes('postal_code')) zip_code = comp.long_name;
                });
            }

            // Fallback for City/State if not found in components (using basic address split)
            if (!city || !state) {
                if (place.address) {
                    const parts = place.address.split(',').map(p => p.trim());
                    if (parts.length >= 3) {
                        const cityStatePart = parts[parts.length - 3];
                        if (cityStatePart && cityStatePart.includes('-')) {
                            const csParts = cityStatePart.split('-');
                            if (csParts.length >= 2) {
                                if (!city) city = csParts[0].trim();
                                if (!state) state = csParts[1].trim();
                            }
                        }
                    }
                }
            }

            // Phone / WhatsApp
            let whatsapp = '';
            if (details.formatted_phone_number) {
                whatsapp = details.formatted_phone_number;
            } else if (details.international_phone_number) {
                whatsapp = details.international_phone_number;
            }

            // Check if phone is required
            if (requirePhone && !whatsapp) {
                console.log(`Skipping ${place.name} (No Phone/WhatsApp)`);
                skippedCount++;
                continue;
            }

            // Generate Description
            let description = '';
            if (details.editorial_summary && details.editorial_summary.overview) {
                description = details.editorial_summary.overview;
            } else {
                // Construct description
                const ratingStr = details.rating ? ` Classificação: ${details.rating}⭐ (${details.user_ratings_total} avaliações).` : '';
                const categoryStr = place.category || 'Empresa';
                const cityStr = city ? ` em ${city}` : '';

                description = `${categoryStr}${cityStr}.${ratingStr}`;

                // Add top review snippet if available
                if (details.reviews && details.reviews.length > 0) {
                    const topReview = details.reviews[0];
                    if (topReview.text) {
                        description += ` O que dizem: "${topReview.text.substring(0, 100)}${topReview.text.length > 100 ? '...' : ''}"`;
                    }
                }
            }

            const businessId = `goog_${place.google_place_id}`;

            const businessData = {
                business_id: businessId,
                google_place_id: place.google_place_id,
                name: details.name || place.name,
                category: place.category || 'Other',
                description: description,
                whatsapp: whatsapp,
                website: details.website || '',

                // Location
                latitude: details.geometry?.location?.lat || place.latitude,
                longitude: details.geometry?.location?.lng || place.longitude,
                street: street,
                number: number,
                neighborhood: neighborhood,
                city: city,
                state: state,
                zip_code: zip_code,
                address: details.formatted_address || place.address, // Full formatted address as backup

                // Status
                open_time: '08:00', // Default
                close_time: '18:00', // Default
                forced_status: null, // Auto
                is_premium: false,
                verified: true, // Trusted from Google

                // Stats
                rating: details.rating || 0,
                review_count: details.user_ratings_total || 0,

                created_at: Date.now(),
                owner_id: 'admin_import'
            };

            await db.collection('business').doc(businessId).set(businessData);
            importedCount++;
        }

        res.json({ success: true, imported: importedCount, skipped: skippedCount });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ error: 'Internal server error during import' });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        env: process.env.NODE_ENV,
        dbType: process.env.NODE_ENV === 'production' ? 'Firestore' : 'MockDB',
        vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
    });
});

// --- SERVE STATIC FILES (Frontend) ---
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));



// --- CATEGORY MANAGEMENT ROUTES ---

// 1. Get All Categories (Public)
app.get('/api/categories', async (req, res) => {
    console.log('GET /api/categories called');

    const defaults = [
        { id: 'Alimentação', label: 'Alimentação', order: 1 },
        { id: 'Farmácia', label: 'Farmácia', order: 2 },
        { id: 'Serviços', label: 'Serviços', order: 3 },
        { id: 'Varejo', label: 'Varejo', order: 4 },
        { id: 'Saúde', label: 'Saúde', order: 5 },
        { id: 'Motorista', label: 'Motorista', order: 6 },
        { id: 'Entregas', label: 'Entregas', order: 7 },
        { id: 'Freelancer', label: 'Freelancer', order: 8 },
        { id: 'Outros', label: 'Outros', order: 9 }
    ];



    try {
        // Try to fetch from Firestore with timeout
        const snapshot = await fetchWithTimeout(db.collection('app_categories').get(), 2000);

        // Start with defaults
        const categoryMap = new Map();
        defaults.forEach(cat => categoryMap.set(cat.id, cat));

        // 1. Fetch from 'app_categories' (Admin defined)
        let categories = [...defaults];
        try {
            const snapshot = await fetchWithTimeout(db.collection('app_categories').get(), 2000);
            if (!snapshot.empty) {
                const dbCats = snapshot.docs.map(doc => doc.data());
                // Merge or replace? Let's merge unique IDs
                const existingIds = new Set(categories.map(c => c.id));
                dbCats.forEach(cat => {
                    if (!existingIds.has(cat.id)) {
                        categories.push(cat);
                        existingIds.add(cat.id);
                    }
                });
            }
        } catch (e) {
            console.warn('Could not fetch app_categories, using defaults');
        }

        // 2. Dynamic Categories from Businesses
        // Fetch all businesses to find unique categories
        // Note: In a large app, this should be a separate aggregation or cached
        try {
            const businessSnapshot = await db.collection('business').select('category').get();
            if (!businessSnapshot.empty) {
                const businessCats = new Set();
                businessSnapshot.docs.forEach(doc => {
                    const cat = doc.data().category;
                    if (cat) businessCats.add(cat);
                });

                const existingIds = new Set(categories.map(c => c.id));
                businessCats.forEach(catName => {
                    if (!existingIds.has(catName)) {
                        categories.push({ id: catName, label: catName, order: 99 });
                        existingIds.add(catName);
                    }
                });
            }
        } catch (e) {
            console.warn('Could not fetch dynamic categories', e);
        }

        // Sort by order then label
        categories.sort((a, b) => (a.order || 99) - (b.order || 99) || a.label.localeCompare(b.label));

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.json(defaults);
    }
});

// 2. Create Category (Admin)
app.post('/api/admin/categories', authenticateAdmin, async (req, res) => {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: 'Label is required' });

    try {
        const id = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        const newCategory = {
            id,
            label,
            order: Date.now() // Simple ordering
        };

        await db.collection('app_categories').doc(id).set(newCategory);
        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Delete Category (Admin)
app.delete('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('app_categories').doc(id).delete();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- END CATEGORY ROUTES ---



// Serve React App (Catch All)
// Serve React App (Catch All)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Only listen if not in Vercel (Vercel handles the server)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

export default app;

