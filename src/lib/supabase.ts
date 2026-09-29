import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

let rawUrl = (env.VITE_SUPABASE_URL || 'https://kfhewlurkhxqzgjyelas.supabase.co').trim();
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');

const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaGV3bHVya2h4cXpnanllbGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2OTA2MzEsImV4cCI6MjEwNjI2NjYzMX0.m8jhX_gO1To7R5jYLa2No3Noxx-D2Mx7_ynkqAYUYBM').trim();

export const supabase = createClient(rawUrl, supabaseAnonKey);

