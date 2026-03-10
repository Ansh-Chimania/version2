import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabase from '../../api/supabase';

export const fetchWatchHistory = createAsyncThunk('watchHistory/fetch', async (page = 1) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const limit = 20;
  const offset = (page - 1) * limit;

  // Get count
  const { count } = await supabase
    .from('watch_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get paginated data
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', user.id)
    .order('watched_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const history = data.map(h => ({
    _id: h.id,
    user: h.user_id,
    tmdbId: h.tmdb_id,
    title: h.title,
    posterPath: h.poster_path,
    backdropPath: h.backdrop_path,
    rating: h.rating,
    releaseDate: h.release_date,
    mediaType: h.media_type,
    overview: h.overview,
    watchedAt: h.watched_at,
    watchType: h.watch_type,
    createdAt: h.created_at
  }));

  return {
    history,
    page,
    total_pages: Math.ceil(count / limit)
  };
});

export const addToWatchHistory = createAsyncThunk('watchHistory/add', async (movieData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if exists (upsert-like)
  const { data: existing } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('tmdb_id', movieData.tmdbId)
    .eq('watch_type', movieData.watchType || 'page_view')
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('watch_history')
      .update({ watched_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return {
      _id: data.id,
      tmdbId: data.tmdb_id,
      title: data.title,
      posterPath: data.poster_path,
      watchedAt: data.watched_at,
      watchType: data.watch_type
    };
  }

  const { data, error } = await supabase
    .from('watch_history')
    .insert({
      user_id: user.id,
      tmdb_id: movieData.tmdbId,
      title: movieData.title,
      poster_path: movieData.posterPath,
      backdrop_path: movieData.backdropPath,
      rating: movieData.rating,
      release_date: movieData.releaseDate,
      media_type: movieData.mediaType,
      overview: movieData.overview,
      watch_type: movieData.watchType || 'page_view'
    })
    .select()
    .single();

  if (error) throw error;
  return {
    _id: data.id,
    tmdbId: data.tmdb_id,
    title: data.title,
    posterPath: data.poster_path,
    watchedAt: data.watched_at,
    watchType: data.watch_type
  };
});

export const clearWatchHistory = createAsyncThunk('watchHistory/clear', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
});

const watchHistorySlice = createSlice({
  name: 'watchHistory',
  initialState: {
    items: [],
    loading: false,
    page: 1,
    total_pages: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.history;
        state.page = action.payload.page;
        state.total_pages = action.payload.total_pages;
      })
      .addCase(clearWatchHistory.fulfilled, (state) => {
        state.items = [];
      });
  }
});

export default watchHistorySlice.reducer;
