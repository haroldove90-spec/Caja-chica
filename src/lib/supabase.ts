import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://embjwhcaymeyfxpkcqap.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYmp3aGNheW1leWZ4cGtjcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDk4MjMsImV4cCI6MjEwMTAyNTgyM30.4oxD0pjaPy09NoF5TTwoNvC7ociDfxEaq_Pn2IHCHqM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
