import { apiRequest } from '../client';
import { Session } from '@supabase/supabase-js';
import { Category } from '@/types';

export const categoriesApi = {
  getAll: (session: Session): Promise<Category[]> =>
    apiRequest('/api/categories', session),

  getById: (session: Session, id: string): Promise<Category> =>
    apiRequest(`/api/categories/${id}`, session),

  create: (session: Session, data: Partial<Category>): Promise<Category> =>
    apiRequest('/api/categories', session, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (session: Session, id: string, data: Partial<Category>): Promise<Category> =>
    apiRequest(`/api/categories/${id}`, session, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  delete: (session: Session, id: string): Promise<void> =>
    apiRequest(`/api/categories/${id}`, session, {
      method: 'DELETE',
    }),
}; 
