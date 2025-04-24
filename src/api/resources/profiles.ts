import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { Profile } from '@/types';

export const profilesApi = {
  getById: (session: Session, id: string) => 
    apiRequest<Profile>(`/api/profiles/${id}`, session),
  
  update: (session: Session, id: string, data: Partial<Profile>) => 
    apiRequest<Profile>(`/api/profiles/${id}`, session, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}; 
