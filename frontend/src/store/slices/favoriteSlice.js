import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabase from '../../api/supabase';

export const fetchFavorites = createAsyncThunk('favorites/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map to camelCase for frontend compatibility
    return data.map(f => ({
      _id: f.id,
      user: f.user_id,
      tmdbId: f.tmdb_id,
      title: f.title,
      posterPath: f.poster_path,
      backdropPath: f.backdrop_path,
      rating: f.rating,
      releaseDate: f.release_date,
      mediaType: f.media_type,
      overview: f.overview,
      createdAt: f.created_at
    }));
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addFavorite = createAsyncThunk('favorites/add', async (movieData, { rejectWithValue }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        tmdb_id: movieData.tmdbId,
        title: movieData.title,
        poster_path: movieData.posterPath,
        backdrop_path: movieData.backdropPath,
        rating: movieData.rating,
        release_date: movieData.releaseDate,
        media_type: movieData.mediaType,
        overview: movieData.overview
      })
      .select()
      .single();

    if (error) throw error;

    return {
      _id: data.id,
      user: data.user_id,
      tmdbId: data.tmdb_id,
      title: data.title,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      rating: data.rating,
      releaseDate: data.release_date,
      mediaType: data.media_type,
      overview: data.overview,
      createdAt: data.created_at
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removeFavorite = createAsyncThunk('favorites/remove', async (tmdbId, { rejectWithValue }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('tmdb_id', parseInt(tmdbId));

    if (error) throw error;
    return tmdbId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => { state.loading = true; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter(f => f.tmdbId !== action.payload);
      });
  }
});

export default favoriteSlice.reducer;
