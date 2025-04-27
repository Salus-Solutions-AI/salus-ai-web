export const VITE_SALUS_SERVER_URL = import.meta.env.VITE_SALUS_SERVER_URL; 
export const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; 
export const VITE_SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; 

if (!VITE_SALUS_SERVER_URL || !VITE_SUPABASE_URL || !VITE_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing required environment variables');
}
