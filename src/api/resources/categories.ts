import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { Category } from '@/types';

export const categoriesApi = {
  getAll: (session: Session) => 
    apiRequest<Category[]>('/api/categories', session),
  
  create: (session: Session, data: Partial<Category>) => 
    apiRequest<Category>('/api/categories', session, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (session: Session, id: string, data: Partial<Category>) => 
    apiRequest<Category>(`/api/categories/${id}`, session, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (session: Session, id: string) => 
    apiRequest<void>(`/api/categories/${id}`, session, {
      method: 'DELETE',
    }),
}; 