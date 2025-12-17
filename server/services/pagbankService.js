// Use Axios for requests (safer than native fetch in some Node envs)
import axios from 'axios';

// PRODUCTION Token provided by User
const PAGBANK_TOKEN = 'dd4ebc96-68a6-4d39-ad7c-cbbc0f921817029f61fc4a84b3a4d4edd63bbabf91c5a481-9f87-49ee-9b67-94a7646f799f';
// PRODUCTION URL
const BASE_URL = 'https://api.pagseguro.com';

export const createPixOrder = async (referenceId, customer, amount, description) => {
    const body = {
        reference_id: referenceId,
        customer: {
            name: customer.name,
            email: customer.email,
            tax_id: customer.cpf || '94723761691', // Fallback Valid CPF (User Provided)
            phones: [
                {
                    country: '55',
                    area: '11',
                    number: '999999999',
                    type: 'MOBILE'
                }
            ]
        },
        items: [
            {
                name: description,
                quantity: 1,
                unit_amount: Math.round(amount * 100)
            }
        ],
        qr_codes: [
            {
                amount: {
                    value: Math.round(amount * 100)
                },
                expiration_date: new Date(Date.now() + 15 * 60 * 1000).toISOString()
            }
        ],
        notification_urls: [
            'https://opennow-282091951030.us-central1.run.app/api/payments/webhook'
        ]
    };

    console.log('[PagBank] Creating Order (Production):', JSON.stringify(body, null, 2));

    try {
        const response = await axios.post(`${BASE_URL}/orders`, body, {
            headers: {
                'Authorization': `Bearer ${PAGBANK_TOKEN}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('[PagBank] Exception:', error.response ? error.response.data : error.message);
        throw new Error(error.response && error.response.data && error.response.data.error_messages ? error.response.data.error_messages[0].description : 'Payment Error');
    }
};
