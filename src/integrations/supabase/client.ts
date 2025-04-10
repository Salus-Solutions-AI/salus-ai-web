
import { createClient } from '@supabase/supabase-js';

// Define different Supabase environment configurations
const environments = {
  local: {
    url: "https://uhudxpdzeddkqebgeqjn.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodWR4cGR6ZWRka3FlYmdlcWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjUzOTMsImV4cCI6MjA1OTgwMTM5M30.CBXjonkopJupIHoQlhZlybVC0zA29i_Q1AgPTHDMU9U"
  },
  production: {
    url: "https://cklbbxfegppikhusrvzm.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrbGJieGZlZ3BwaWtodXNydnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MDc2ODUsImV4cCI6MjA1Njk4MzY4NX0.avxJkjrjCtAGHF9AErPfgr3y3GQTU3QnFO4LuMLZEu0"
  }
};

// Determine which environment we're in - we'll consider it local if the URL has 'localhost' or specified port
const isLocalEnvironment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.port === '8080';
};

// Select the appropriate configuration
const config = isLocalEnvironment() ? environments.local : environments.production;

// Log which environment is being used (helpful for debugging)
console.log(`Using Supabase environment: ${isLocalEnvironment() ? 'local' : 'production'}`);

// Create and export the Supabase client
export const supabase = createClient(config.url, config.anonKey);
