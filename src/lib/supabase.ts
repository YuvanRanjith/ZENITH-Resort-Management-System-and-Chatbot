import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const isConfigured = Boolean(url && key);
export const supabase = createClient(url || 'https://unconfigured.supabase.co', key || 'unconfigured', { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = key;
