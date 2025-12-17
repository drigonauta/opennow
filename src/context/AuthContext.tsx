import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    type User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    leadProfile: any | null;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    registerWithEmail: (email: string, pass: string) => Promise<User>;
    registerLead: (data: any) => Promise<void>;
    trackAction: (action_type: string, target_id?: string, details?: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [leadProfile, setLeadProfile] = useState<any | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                currentUser.getIdToken().then(token => {
                    localStorage.setItem('authToken', token);
                });
                // Fetch Lead Profile
                try {
                    const res = await fetch(`/api/leads/${currentUser.uid}`);
                    if (res.ok) {
                        const data = await res.json();
                        setLeadProfile(data);
                    } else if (res.status === 404) {
                        // Auto-register if profile doesn't exist (e.g. Google Login first time)
                        console.log("Lead profile not found, auto-registering...");
                        const newLead = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            name: currentUser.displayName || 'Usuário Google',
                            phone: currentUser.phoneNumber || '',
                            city: 'Indefinido',
                            state: 'MG',
                            referral_source: 'google_auth_auto'
                        };

                        const regRes = await fetch('/api/leads/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newLead)
                        });

                        if (regRes.ok) {
                            console.log("Lead auto-registered successfully.");
                            setLeadProfile(newLead);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch or create lead profile", error);
                }
            } else {
                localStorage.removeItem('authToken');
                setLeadProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const loginWithEmail = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const registerWithEmail = async (email: string, pass: string) => {
        const credential = await createUserWithEmailAndPassword(auth, email, pass);
        return credential.user;
    };

    const registerLead = async (data: any) => {
        // 1. Create Firebase User
        const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = credential.user;

        // 2. Register Lead in Backend
        const leadData = {
            uid: user.uid,
            email: data.email,
            name: data.name,
            phone: data.phone,
            city: data.city,
            state: data.state,
            profession: data.profession,
            referral_source: data.referral_source,
            has_business: data.has_business
        };

        const res = await fetch('/api/leads/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });

        if (!res.ok) throw new Error('Failed to register lead profile');

        // Set local state immediately
        setLeadProfile(leadData);
    };

    const trackAction = async (action_type: string, target_id?: string, details?: any) => {
        if (!user) return;
        try {
            await fetch('/api/leads/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    action_type,
                    target_id,
                    details
                })
            });
        } catch (error) {
            console.error("Failed to track action", error);
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        localStorage.removeItem('authToken');
        setLeadProfile(null);
    };

    const refreshProfile = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/leads/${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setLeadProfile(data);
            }
        } catch (error) {
            console.error("Failed to refresh lead profile", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, leadProfile, loginWithGoogle, loginWithEmail, registerWithEmail, registerLead, trackAction, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
