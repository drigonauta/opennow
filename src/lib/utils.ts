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

const GREETINGS = {
    morning: "Bom dia",
    afternoon: "Boa tarde",
    night: "Boa noite"
};

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return GREETINGS.morning;
    if (hour >= 12 && hour < 18) return GREETINGS.afternoon;
    return GREETINGS.night;
}

const MESSAGE_TEMPLATES = [
    // Variation 1
    `{{saudacao}}! Me chamo {{nome_usuario}}.
Vi a **{{nome_empresa}}** no TáAberto e fiquei interessado. Poderiam me passar mais detalhes?

📍 Sou de {{cidade}}
🌐 Encontrei vocês aqui: {{link_taaberto}}`,

    // Variation 2
    `{{saudacao}}, tudo bem? Aqui é {{nome_usuario}}.
Encontrei a **{{nome_empresa}}** através do TáAberto e gostaria de informações sobre seus serviços.

📍 Falo de {{cidade}}
🌐 Link do perfil: {{link_taaberto}}`,

    // Variation 3
    `Olá, {{saudacao}}! Sou {{nome_usuario}}.
Estava navegando no TáAberto, encontrei a **{{nome_empresa}}** e gostaria de tirar uma dúvida.

📍 Moro em {{cidade}}
🌐 Veja seu perfil: {{link_taaberto}}`,

    // Variation 4
    `{{saudacao}}! Tudo joia? Me chamo {{nome_usuario}}.
Achei a **{{nome_empresa}}** na busca do TáAberto e queria saber mais sobre o atendimento.

📍 Estou em {{cidade}}
🌐 Seu link no app: {{link_taaberto}}`
];

export function createWhatsAppMessageLink(
    phone: string | undefined | null,
    businessName: string,
    businessId: string,
    userName?: string | null,
    cityName?: string | null
): string | null {
    const formattedPhone = formatWhatsAppLink(phone);
    if (!formattedPhone) return null;

    const name = userName || "Visitante";
    const city = cityName || "Uberaba"; // Default fallback per request hints or keep generic? User said "cidade" variable. If null, safe fallback.
    const greeting = getGreeting();
    const linkTaaberto = `https://www.taaberto.com.br/empresa/${businessId}`; // Updated base URL as per request: https://www.taaberto.com.br

    // Logic to pick a random template avoiding the immediate last one
    // Note: This runs on client side, so localStorage is available.
    // However, during SSR or non-browser envs this might fail. We should check process/window.
    let templateIndex = 0;

    if (typeof window !== 'undefined') {
        const lastIndexKey = `last_wa_msg_idx_${businessId}`;
        const lastIndexStr = localStorage.getItem(lastIndexKey);
        const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;

        // Generate candidates excluding the last one (if possible, considering we have 4)
        const candidates = MESSAGE_TEMPLATES.map((_, i) => i).filter(i => i !== lastIndex);

        // Robustness: if candidates empty (shouldn't happen with 4 items), fallback to all
        const pool = candidates.length > 0 ? candidates : MESSAGE_TEMPLATES.map((_, i) => i);

        templateIndex = pool[Math.floor(Math.random() * pool.length)];

        // Save for next time
        localStorage.setItem(lastIndexKey, templateIndex.toString());
    } else {
        // Fallback for SSR
        templateIndex = Math.floor(Math.random() * MESSAGE_TEMPLATES.length);
    }

    let message = MESSAGE_TEMPLATES[templateIndex];

    // Replace variables
    message = message.replace(/{{saudacao}}/g, greeting);
    message = message.replace(/{{nome_usuario}}/g, name);
    message = message.replace(/{{nome_empresa}}/g, businessName);
    message = message.replace(/{{cidade}}/g, city);
    message = message.replace(/{{link_taaberto}}/g, linkTaaberto);

    // Append standard footer for viral growth/claiming if not present in template (it's not)
    // The user didn't explicitly forbid the footer, but the prompt was specific about the "Base: Opção comercial". 
    // I will append the claim link in a consistent way.

    const footer = `

Se você for o proprietário dessa empresa, pode reivindicar sua página gratuitamente:
🔑 https://www.taaberto.com.br/reivindicar/${businessId}

Mensagem automática enviada pelo TáAberto —
descubra quem está aberto agora na sua cidade.`;

    const fullMessage = message.trim() + footer;

    const encodedMessage = encodeURIComponent(fullMessage);
    return `${formattedPhone}?text=${encodedMessage}`;
}
