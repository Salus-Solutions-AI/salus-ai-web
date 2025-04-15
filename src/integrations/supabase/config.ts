
// Simple, reliable configuration for Supabase

// Development configuration
const DEV_CONFIG = {
  url: "https://uhudxpdzeddkqebgeqjn.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodWR4cGR6ZWRka3FlYmdlcWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjUzOTMsImV4cCI6MjA1OTgwMTM5M30.CBXjonkopJupIHoQlhZlybVC0zA29i_Q1AgPTHDMU9U",
};

// Production configuration
const PRODUCTION_CONFIG = {
  url: "https://cklbbxfegppikhusrvzm.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrbGJieGZlZ3BwaWtodXNydnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MDc2ODUsImV4cCI6MjA1Njk4MzY4NX0.avxJkjrjCtAGHF9AErPfgr3y3GQTU3QnFO4LuMLZEu0",
};

// Determine which configuration to use based on the environment
// This runs both on the server and in the browser
const determineConfig = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return DEV_CONFIG; // Default to local for SSR
  }
  
  // Client-side rendering
  const hostname = window.location.hostname;
  const isProduction = 
    hostname !== 'localhost' && 
    !hostname.includes('127.0.0.1') && 
    !hostname.includes('.lovable.dev');
  
  return isProduction ? PRODUCTION_CONFIG : DEV_CONFIG;
};

// Export the configuration based on environment
export const supabaseConfig = determineConfig();

// Export individual values for convenience
export const SUPABASE_URL = supabaseConfig.url;
export const SUPABASE_PUBLISHABLE_KEY = supabaseConfig.key;

// For debugging purposes
if (typeof window !== 'undefined') {
  console.log(`Using Supabase environment: ${supabaseConfig.url.includes('cklbbxfegppikhusrvzm') ? 'Production' : 'Development'}`);
}
