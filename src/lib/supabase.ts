import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

let rawUrl = (env.VITE_SUPABASE_URL || 'https://embjwhcaymeyfxpkcqap.supabase.co').trim();
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');

const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYmp3aGNheW1leWZ4cGtjcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDk4MjMsImV4cCI6MjEwMTAyNTgyM30.4oxD0pjaPy09NoF5TTwoNvC7ociDfxEaq_Pn2IHCHqM').trim();

export const supabase = createClient(rawUrl, supabaseAnonKey);

