import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatWhatsAppLink(phone: string | undefined | null): string | null {
    if (!phone) return null;

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    if (!cleaned) return null;

    // If it starts with 55 and is long enough (12-13 digits), assume it's already formatted
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
        return `https://wa.me/${cleaned}`;
    }

    // If it's a standard Brazilian number (10-11 digits), prepend 55
    if (cleaned.length >= 10 && cleaned.length <= 11) {
        return `https://wa.me/55${cleaned}`;
    }

    // Fallback: return as is if it doesn't match known patterns but has digits
    // This handles cases where it might be an international number without +
    return `https://wa.me/${cleaned}`;
}
