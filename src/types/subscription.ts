export type PlanType = 'free' | 'gold' | 'diamond';

export interface PlanFeatures {
    basicProfile: boolean;
    hours: boolean;
    address: boolean;
    whatsapp: boolean;
    highlight?: boolean;
    photosLimit: number;
    metrics?: 'none' | 'basic' | 'advanced';
    verifiedBadge?: boolean;
    shortLink?: boolean;
    prioritySupport?: boolean;
    top3?: boolean;
    animatedCover?: boolean;
    video?: boolean;
    customPage?: boolean;
    aiChat?: boolean;
    marketingDiscount?: boolean;
}

export interface PlanDetails {
    id: PlanType;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    features: PlanFeatures;
}

export interface Subscription {
    subscription_id: string;
    business_id: string;
    plan: PlanType;
    status: 'active' | 'canceled' | 'expired';
    start_date: number;
    renew_date: number;
    amount: number;
    billing_cycle: 'monthly' | 'yearly';
}

export interface ClaimRequest {
    userId: string;
    businessId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    planSelected: PlanType;
    billingCycle: 'monthly' | 'yearly';
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
}
