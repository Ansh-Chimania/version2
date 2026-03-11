const axios = require('axios');

const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Mock Data for Demo Fallback
const MOCK_DATA = {
  trending: {
    results: [
      { id: 1, title: 'Inception', poster_path: '/edv5bs1pSOuterCCv08YmSbs7.jpg', vote_average: 8.8, release_date: '2010-07-15' },
      { id: 2, title: 'The Dark Knight', poster_path: '/qJ2tW6WMUDp9s1vmsTu9U3D3Spx.jpg', vote_average: 9.0, release_date: '2008-07-18' },
      { id: 3, title: 'Interstellar', poster_path: '/gEU2QniE6E07Qv86QJu9AobHTay.jpg', vote_average: 8.6, release_date: '2014-11-05' },
      { id: 4, title: 'The Matrix', poster_path: '/f89U3Y9YvYvYvYvYvYvYvYvYvYv.jpg', vote_average: 8.7, release_date: '1999-03-31' }
    ]
  },
  genres: {
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 35, name: 'Comedy' }
    ]
  }
};

const tmdbFetch = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${TMDB_BASE}${endpoint}`, {
      params: { api_key: API_KEY, ...params },
      timeout: 10000 // 10s timeout
    });
    return response.data;
  } catch (error) {
    console.warn(`[TMDB Fallback] Request to ${endpoint} failed, providing mock data for demo.`);

    // Fallback logic for demo purposes
    if (endpoint.includes('trending')) return MOCK_DATA.trending;
    if (endpoint.includes('genre')) return MOCK_DATA.genres;
    if (endpoint.includes('movie/popular')) return MOCK_DATA.trending;

    return { results: [], message: "Data unavailable (Network Block)" };
  }
};

exports.getTrending = async (req, res) => {
  try {
    const { time_window = 'week', page = 1 } = req.query;
    const data = await tmdbFetch(`/trending/all/${time_window}`, { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/movie/popular', { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getTopRatedMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/movie/top_rated', { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getUpcomingMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/movie/upcoming', { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getNowPlayingMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/movie/now_playing', { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getPopularTV = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/tv/popular', { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getTopRatedTV = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/tv/top_rated', { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getAiringTodayTV = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/tv/airing_today', { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getMovieDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbFetch(`/movie/${id}`, {
      append_to_response: 'videos,credits,similar,recommendations,images'
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
};

exports.getTVDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbFetch(`/tv/${id}`, {
      append_to_response: 'videos,credits,similar,recommendations,images'
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV details' });
  }
};

exports.searchMulti = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.json({ results: [], total_pages: 0, total_results: 0 });
    const data = await tmdbFetch('/search/multi', { query, page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getGenres = async (req, res) => {
  try {
    const { type = 'movie' } = req.query;
    const data = await tmdbFetch(`/genre/${type}/list`);
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.genres);
  }
};

exports.discoverByGenre = async (req, res) => {
  try {
    const { genre_id, page = 1, type = 'movie' } = req.query;
    const data = await tmdbFetch(`/discover/${type}`, {
      with_genres: genre_id,
      page,
      sort_by: 'popularity.desc'
    });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};

exports.getPopularPeople = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbFetch('/person/popular', { page });
    res.json(data);
  } catch (error) {
    res.json({ results: [] });
  }
};

exports.getPersonDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbFetch(`/person/${id}`, {
      append_to_response: 'movie_credits,tv_credits,images'
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch person details' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'movie', page = 1 } = req.query;
    const data = await tmdbFetch(`/${type}/${id}/recommendations`, { page });
    res.json(data);
  } catch (error) {
    res.json(MOCK_DATA.trending);
  }
};
