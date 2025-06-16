import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { Organization } from '@/types';

export const organizationsApi = {
  create: (session: Session, data: Partial<Organization>) => 
    apiRequest<Organization>('/api/organizations', session, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getById: (session: Session, id: string) => 
    apiRequest<Organization>(`/api/organizations/${id}`, session),
  
  update: (session: Session, id: string, data: Partial<Organization>) => 
    apiRequest<Organization>(`/api/organizations/${id}`, session, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}; 
