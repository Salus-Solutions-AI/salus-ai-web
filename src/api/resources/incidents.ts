import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { Incident } from '@/types';

export const incidentsApi = {
  getAll: (session: Session) =>
    apiRequest<Incident[]>('/api/incidents', session),

  getById: (session: Session, id: string) =>
    apiRequest<Incident>(`/api/incidents/${id}`, session),

  create: (session: Session, data: FormData) =>
    apiRequest<Incident>('/api/incidents', session, {
      method: 'POST',
      body: data,
      headers: {},
    }),

  update: (session: Session, id: string, data: Partial<Incident>) =>
    apiRequest<Incident>(`/api/incidents/${id}`, session, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  delete: (session: Session, id: string) =>
    apiRequest<Incident>(`/api/incidents/${id}`, session, {
      method: 'DELETE',
    }),
}; 
