import { supabase } from '@/integrations/supabase/client';

export const uploadLog = (filePath, content) => {
    return supabase.storage
    .from('logs')
    .upload(filePath, content);
}

export const getLogFile = (filePath) => {
    return supabase.storage
    .from('logs')
    .getPublicUrl(filePath);
}

export const downloadLog = (log) => {
    return supabase.storage
    .from('logs')
    .download(log.filePath);
}

export const deleteLogFiles = async (files) => {
    return supabase.storage
    .from('logs')
    .remove(files);
}
