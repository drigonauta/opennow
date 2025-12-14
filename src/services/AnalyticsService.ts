import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export const AnalyticsService = {
    async logEvent(type: 'whatsapp' | 'call' | 'view' | 'claim', businessId: string, userId?: string) {
        try {
            // 1. Log detailed event
            await addDoc(collection(db, 'analytics_events'), {
                type,
                businessId,
                userId: userId || 'anonymous',
                timestamp: serverTimestamp(),
                device: navigator.userAgent
            });

            // 2. Increment aggregate stats on Business document
            const businessRef = doc(db, 'businesses', businessId);
            const updates: any = {
                'analytics.clicks': increment(1), // Total interactions
                updated_at: Date.now()
            };

            if (type === 'whatsapp') {
                updates['analytics.whatsapp_clicks'] = increment(1);
            } else if (type === 'call') {
                updates['analytics.call_clicks'] = increment(1);
            } else if (type === 'view') {
                updates['analytics.views'] = increment(1);
            }

            await updateDoc(businessRef, updates);

        } catch (error) {
            console.error('Error logging analytics event:', error);
            // Fail silently to not disrupt user experience
        }
    },

    async vote(businessId: string, type: 'like' | 'dislike', token?: string) {
        if (!token) {
            console.error("Vote requires authentication");
            throw new Error("Login required");
        }

        try {
            const response = await fetch(`/api/business/${businessId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to vote');
            }

            return await response.json(); // { success: true, likes, dislikes }
        } catch (error) {
            console.error('Error logging preference:', error);
            throw error;
        }
    }
};
