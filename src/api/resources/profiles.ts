import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { Profile } from '@/types';

export const profilesApi = {
  create: (session: Session, data: Partial<Profile>) => 
    apiRequest<Profile>('/api/profiles', session, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getById: (session: Session, id: string) => 
    apiRequest<Profile>(`/api/profiles/${id}`, session),
  
  update: (session: Session, id: string, data: Partial<Profile>) => 
    apiRequest<Profile>(`/api/profiles/${id}`, session, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}; 
