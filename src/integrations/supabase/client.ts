import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } from '../../config';

console.log("here are the vars")
console.log(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

export const supabase = createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);