export type Category = string;

export interface Business {
    business_id: string;
    owner_id: string;
    name: string;
    category: string;
    description: string;
    open_time: string;
    close_time: string;
    forced_status: 'open' | 'closed' | null;
    whatsapp: string;
    phone?: string;
    is_verified?: boolean;
    latitude: number;
    longitude: number;
    state?: string;
    city?: string;
    zip_code?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    address?: string;
    google_place_id?: string;
    rating?: number;
    review_count?: number;
    user_ratings_total?: number;
    is_premium?: boolean;
    plan: 'free' | 'pro' | 'dominante';
    subscription_expiry?: number;
    highlight_expires_at?: number;
    ad_credits?: number;
    analytics?: {
        views: number;
        clicks: number;
        whatsapp_clicks?: number;
        call_clicks?: number;
        appearances: number;
    };
    created_at: number;
    updated_at: number;
}

export interface AdCampaign {
    id: string;
    imageUrl: string;
    link: string; // Business ID or External URL
    durationMinutes: number;
    startTime: number;
    status: 'active' | 'scheduled' | 'expired';
    type: 'admin' | 'automated';
    priority: number;
    clientName?: string; // For admin tracking
    businessId?: string; // If linked to internal business
    neonColor?: string;
}
