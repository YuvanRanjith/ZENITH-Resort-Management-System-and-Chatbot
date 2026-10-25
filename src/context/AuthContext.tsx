import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isConfigured } from '@/lib/supabase';
import type { Customer, Employee, StaffRole } from '@/lib/types';
const roles: string[] = ['manager', 'assistant_manager', 'receptionist', 'clerk', 'room_service'];
function useSessionState() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(isConfigured);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!isConfigured)
            return;
        let active = true;
        const { data } = supabase.auth.onAuthStateChange((_event, next) => { if (active) {
            setSession(next);
            setLoading(false);
        } });
        supabase.auth.getSession().then(({ data, error }) => { if (active) {
            setSession(data.session);
            setError(error?.message || '');
            setLoading(false);
        } }).catch(e => { if (active) {
            setError(String(e));
            setLoading(false);
        } });
        return () => { active = false; data.subscription.unsubscribe(); };
    }, []);
    const rawRole = session?.user.app_metadata.role;
    const role: StaffRole | null = roles.includes(rawRole) ? rawRole : null;
    return { session, user: session?.user ?? null, role, accountKind: session ? (role ? 'staff' : 'customer') : null, customer: null as Customer | null, employee: null as Employee | null, loading, error,
        signOut: async () => { const { error } = await supabase.auth.signOut(); if (error)
            throw error; }, refresh: async () => { const { data } = await supabase.auth.getSession(); setSession(data.session); } };
}
const AuthContext = createContext<ReturnType<typeof useSessionState> | undefined>(undefined);
export function AuthProvider({ children }: {
    children: ReactNode;
}) { const value = useSessionState(); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export function useAuth() { const value = useContext(AuthContext); if (!value)
    throw new Error('Auth provider required'); return value; }
