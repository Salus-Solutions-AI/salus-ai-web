import { Session } from '@supabase/supabase-js';
import { apiRequest } from '../client';
import { DefaultCategory } from '@/types';

export const defaultCategoriesApi = {
  getAll: (session: Session) => 
    apiRequest<DefaultCategory[]>('/api/default_categories', session),
};
