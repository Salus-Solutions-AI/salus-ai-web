import { VITE_SALUS_SERVER_URL } from '@/config';
import { Session } from '@supabase/supabase-js';

// Base API request function with authentication
export async function apiRequest<T>(
  endpoint: string, 
  session: Session,
  options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
): Promise<T> {
  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  };

  const response = await fetch(`${VITE_SALUS_SERVER_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
