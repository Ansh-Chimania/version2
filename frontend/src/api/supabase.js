import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ayrmkazxomtinmnaduov.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cm1rYXp4b210aW5tbmFkdW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjUwOTksImV4cCI6MjA4ODYwMTA5OX0.ntffF0iHvwph7Y74H-Jzndn7fDsOkfE30rCwxh7KZx0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'cineverse_supabase_auth',
    detectSessionInUrl: false
  }
});

export default supabase;
