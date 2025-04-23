import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { Profile } from '@/types';

export const profilesApi = {
  getById: (session: Session, id: string) => 
    apiRequest<Profile>(`/api/profiles/${id}`, session),
}; 
