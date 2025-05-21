import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { Incident } from '@/types';

export const incidentsApi = {
  getAll: (session: Session, startTime?: string, endTime?: string) => {
    const queryParams: Record<string, string> = {};
    if (startTime) queryParams.start_time = startTime;
    if (endTime) queryParams.end_time = endTime;
    return apiRequest<Incident[]>('/api/incidents', session, undefined, queryParams);
  },

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

  getDuplicates: (session: Session, id: string): Promise<Incident[]> =>
    apiRequest(`/api/incidents/${id}/duplicates`, session),
}; 
