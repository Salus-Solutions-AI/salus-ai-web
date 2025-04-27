import { apiRequest } from '../client';
import { Session } from '@supabase/supabase-js';
import { Category } from '@/types';

export const defaultCategoriesApi = {
  getAll: (session: Session): Promise<Category[]> => 
    apiRequest('/api/default_categories', session),
};
