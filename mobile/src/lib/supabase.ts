/*
 * The ONE Supabase client for the mobile app.
 * It points at the SAME Supabase project as the website, so the same
 * accounts, products and cart rows are used on both.
 */
// Gives Supabase a "localStorage" that is saved on the phone (SQLite),
// so the user stays signed in after closing the app.
import 'expo-sqlite/localStorage/install';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase settings. Create mobile/.env from .env.example ' +
      '(EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY), then restart Expo.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', // Fallback stops the app crashing if .env is missing
  supabaseAnonKey || 'placeholder_key',
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // There are no URLs in a mobile app
    },
  }
);

// Only refresh the login token while the app is open on screen
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
