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
    plan?: 'free' | 'gold' | 'diamond';
    analytics?: {
        views: number;
        clicks: number;
        appearances: number;
    };
    created_at: number;
    updated_at: number;
}
