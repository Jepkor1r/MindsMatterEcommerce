import { createClient } from '@supabase/supabase-js';

// Get the environment variables from Vite
// In Vite, environment variables exposed to the client must start with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase credentials. Make sure you have created a .env.local file ' +
    'in the root of your project with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Create and export the Supabase client
// This is the "waiter" that will take requests from our React app (customer)
// to the Supabase database (kitchen).
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', // Fallback prevents crashing during initial setup
  supabaseAnonKey || 'placeholder_key'
);
