import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabase from '../../api/supabase';

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('cineverse_user');
    return user ? JSON.parse(user) : null;
  } catch { return null; }
};

export const signup = createAsyncThunk('auth/signup', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) throw authError;

    // Update profile name
    if (authData.user) {
      await supabase
        .from('profiles')
        .update({ name, email })
        .eq('id', authData.user.id);
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const user = {
      id: authData.user.id,
      name: profile?.name || name,
      email: profile?.email || email,
      role: profile?.role || 'user',
      avatar: profile?.avatar || '',
      preferences: profile?.preferences || { darkMode: true, favoriteGenres: [] }
    };

    localStorage.setItem('cineverse_token', authData.session.access_token);
    localStorage.setItem('cineverse_user', JSON.stringify(user));

    return {
      token: authData.session.access_token,
      user
    };
  } catch (error) {
    return rejectWithValue(error.message || 'Signup failed');
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    if (profile.is_banned) {
      await supabase.auth.signOut();
      return rejectWithValue('Your account has been banned');
    }

    const user = {
      id: data.user.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      preferences: profile.preferences
    };

    localStorage.setItem('cineverse_token', data.session.access_token);
    localStorage.setItem('cineverse_user', JSON.stringify(user));

    return {
      token: data.session.access_token,
      user
    };
  } catch (error) {
    return rejectWithValue(error.message || 'Login failed');
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    const user = {
      id: authUser.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      preferences: profile.preferences,
      createdAt: profile.created_at
    };

    localStorage.setItem('cineverse_user', JSON.stringify(user));
    return { user };
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to get profile');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ name, avatar, preferences }, { rejectWithValue }) => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not authenticated');

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (preferences !== undefined) updates.preferences = preferences;
    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) throw error;

    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      preferences: profile.preferences
    };

    localStorage.setItem('cineverse_user', JSON.stringify(user));
    return { user };
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    token: localStorage.getItem('cineverse_token'),
    isAuthenticated: !!localStorage.getItem('cineverse_token'),
    loading: false,
    error: null
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('cineverse_token');
      localStorage.removeItem('cineverse_user');
      supabase.auth.signOut();
    },
    clearError(state) {
      state.error = null;
    },
    setSession(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const { logout, clearError, setSession } = authSlice.actions;
export default authSlice.reducer;
