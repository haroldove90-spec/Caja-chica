import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

export const TARGET_SUPABASE_PROJECT_ID = 'kfhewlurkhxqzgjyelas';
export const TARGET_SUPABASE_URL = 'https://kfhewlurkhxqzgjyelas.supabase.co';
export const TARGET_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaGV3bHVya2h4cXpnanllbGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2OTA2MzEsImV4cCI6MjEwNjI2NjYzMX0.m8jhX_gO1To7R5jYLa2No3Noxx-D2Mx7_ynkqAYUYBM';

let rawUrl = (env.VITE_SUPABASE_URL || TARGET_SUPABASE_URL).trim();

// Si el entorno tiene configurada la URL antigua o deprecada, descartarla y forzar la nueva
if (!rawUrl || rawUrl.includes('embjwhcaymeyfxpkcqap')) {
  rawUrl = TARGET_SUPABASE_URL;
}
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');

let supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || TARGET_SUPABASE_ANON_KEY).trim();
// Si el entorno tiene la clave antigua de embjwhcaymeyfxpkcqap o no coincide con el nuevo proyecto, forzar la nueva
if (!supabaseAnonKey || supabaseAnonKey.includes('embjwhcaymeyfxpkcqap') || (rawUrl === TARGET_SUPABASE_URL && !supabaseAnonKey.includes('kfhewlurkhxqzgjyelas'))) {
  supabaseAnonKey = TARGET_SUPABASE_ANON_KEY;
}

export const activeSupabaseUrl = rawUrl;
export const activeSupabaseAnonKey = supabaseAnonKey;

export const supabase = createClient(rawUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
