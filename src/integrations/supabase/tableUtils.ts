import { supabase } from '@/integrations/supabase/client';

export const getProfile = (id) => {
    return supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
}

export const getUserOrganization = (userId) => {
    return supabase
    .from('profiles')
    .select('organization')
    .eq('id', userId)
    .single();
}

export const setCreatedCategories = (id) => {
    return supabase
    .from('profiles')
    .update({ created_categories: true })
    .eq('id', id);
}

export const updateUserProfile = (id, updates) => {
    console.log("Updating profile with:", updates); // Debug log
    return supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);
}

export const getCategories = () => {
    return supabase
    .from('categories')
    .select('*')
    .order('name');
}

export const getDefaultCategories = () => {
    return supabase
    .from('default_categories')
    .select('*')
    .order('name');
}

export const insertCategories = (categories) => {
    return supabase
    .from('categories')
    .insert(categories);
}

export const getIncidents = (id) => {
    return supabase
    .from('incidents')
    .select(`
        *,
        profiles (
            full_name
        )
    `)
    .eq('uploaded_by', id);
}

export const getIncidentById = (id) => {
    return supabase
    .from('incidents')
    .select(`
        *,
        profiles (
            full_name
        )
    `)
    .eq('id', id)
    .single();
}

export const updateIncident = (id, updates) => {
    // Convert camelCase to snake_case for database
    const convertedUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
        // Convert camelCase to snake_case
        if (key === 'isClery') {
            convertedUpdates['is_clery'] = value;
        } else if (key === 'needsMoreInfo') {
            convertedUpdates['needs_more_info'] = value;
        } else if (key === 'requiresTimelyWarning') {
            convertedUpdates['requires_timely_warning'] = value;
        } else {
            convertedUpdates[key] = value;
        }
    }
    
    return supabase
    .from('incidents')
    .update(convertedUpdates)
    .eq('id', id);
}

export const getTodaysIncidents = (id) => {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    return supabase
    .from('incidents')
    .select(`
        *,
        profiles (
            full_name
        )
    `)
    .eq('uploaded_by', id)
    .gte('uploaded_at', startOfDay)
}

export const deleteIncident = (id) => {
    return supabase
    .from('incidents')
    .delete()
    .eq('id', id);
}

export const insertLog = (log) => {
    return supabase
    .from('logs')
    .insert(log);
}

export const getLog = (logId) => {
    return supabase
    .from('logs')
    .select('url')
    .eq('id', logId)
    .single();
}

export const getLogs = (user) => {
    return supabase
    .from('logs')
    .select(`
        *,
        profiles (
            full_name
        )
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });
}

export const deleteLog = (log) => {
    return supabase
    .from('logs')
    .delete()
    .eq('id', log.id);
}
