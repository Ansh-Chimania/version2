const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ayrmkazxomtinmnaduov.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cm1rYXp4b210aW5tbmFkdW92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyNTA5OSwiZXhwIjoyMDg4NjAxMDk5fQ.n4850lNSMdOzRjZQ_8ykpQsrryRvtQlV1dsbcsYfIpo';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cm1rYXp4b210aW5tbmFkdW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjUwOTksImV4cCI6MjA4ODYwMTA5OX0.ntffF0iHvwph7Y74H-Jzndn7fDsOkfE30rCwxh7KZx0';

// Admin client (bypasses RLS) - for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Public client (respects RLS) - for user-scoped operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a Supabase client scoped to a specific user's JWT.
 * This client will respect RLS policies for that user.
 */
const createUserClient = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

module.exports = { supabase, supabaseAdmin, createUserClient };
