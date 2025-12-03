import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// --- Interfaces ---

interface Business {
    business_id: string;
    name: string;
    category: string;
    forced_status: string | null;
    is_premium: boolean;
    latitude: number;
    longitude: number;
    zip_code?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    verified?: boolean;
    state?: string;
    city?: string;
    open_time?: string;
    close_time?: string;
}

interface StatItem {
    name: string;
    category: string;
    clicks: number;
}

interface Stats {
    total_businesses: number;
    ranking: StatItem[];
}

interface Lead {
    uid: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    has_business: boolean;
    created_at: string;
    stats?: {
        visits: number;
        whatsapp_clicks: number;
    };
    type?: string;
    status?: string;
    notes?: string;
    contact?: string;
}

interface Category {
    id: string;
    label: string;
}

interface AdminContextType {
    stats: Stats | null;
    businesses: Business[];
    leads: Lead[];
    categories: Category[];
    loading: boolean;
    refreshData: () => Promise<void>;
    setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    openCount: number;
    closedCount: number;
    premiumCount: number;
    handleSync: () => Promise<void>;
    isSyncing: boolean;
}

// --- 1. Context Definition (Exported First) ---
export const AdminContext = createContext<AdminContextType | undefined>(undefined);

// --- 2. Provider Component ---
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 2.1 State Definitions
    const [stats, setStats] = useState<Stats | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // 2.2 Function Definitions (Defined before use)
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/sync', {
                method: 'POST',
                headers: { Authorization: `Bearer admin-secret-token` }
            });
            if (res.ok) {
                alert('Sincronização enviada com sucesso! O site deve atualizar em instantes.');
            } else {
                alert('Erro ao sincronizar.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao sincronizar.');
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = 'admin-secret-token';

            const [statsRes, businessRes, leadsRes, categoriesRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/businesses', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/leads', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/categories')
            ]);

            if (statsRes.ok) setStats(await statsRes.json());

            if (businessRes.ok) {
                const data = await businessRes.json();
                setBusinesses(data);
            }

            if (leadsRes.ok) {
                const leadsData = await leadsRes.json();
                setLeads(leadsData);
            }
            if (categoriesRes.ok) setCategories(await categoriesRes.json());

        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    // 2.3 Effects
    useEffect(() => {
        fetchData();
    }, []);

    // 2.4 Memoized Calculations (Strict local variables)
    const counts = useMemo(() => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let open = 0;
        let closed = 0;
        let premium = 0;

        businesses.forEach(b => {
            if (b.is_premium) premium++;

            if (b.forced_status === 'open') {
                open++;
                return;
            }
            if (b.forced_status === 'closed') {
                closed++;
                return;
            }

            if (b.open_time && b.close_time) {
                try {
                    const [openH, openM] = b.open_time.split(':').map(Number);
                    const [closeH, closeM] = b.close_time.split(':').map(Number);
                    const start = openH * 60 + openM;
                    const end = closeH * 60 + closeM;

                    if (currentMinutes >= start && currentMinutes < end) {
                        open++;
                    } else {
                        closed++;
                    }
                } catch {
                    closed++;
                }
            } else {
                closed++;
            }
        });

        // Explicit return object
        return {
            openCount: open,
            closedCount: closed,
            premiumCount: premium
        };
    }, [businesses]);

    // 2.5 Explicit Context Value Construction
    const contextValue: AdminContextType = {
        stats,
        businesses,
        leads,
        categories,
        loading,
        refreshData: fetchData,
        setBusinesses,
        setLeads,
        setCategories,
        openCount: counts.openCount,
        closedCount: counts.closedCount,
        premiumCount: counts.premiumCount,
        handleSync,
        isSyncing
    };

    // 2.6 Return Provider
    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );
};

// --- 3. Hook Definition ---
export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
