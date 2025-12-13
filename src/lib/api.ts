
// centralized API configuration
// We use the direct Cloud Run URL to avoid custom domain mapping issues (503s on taaberto.com.br)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://opennow-282091951030.us-central1.run.app';
