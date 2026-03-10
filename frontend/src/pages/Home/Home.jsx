import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTrending,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchNowPlaying,
  fetchPopularTV,
  fetchTopRatedTV
} from '../../store/slices/movieSlice';
import { fetchFavorites } from '../../store/slices/favoriteSlice';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import MovieRow from '../../components/MovieRow/MovieRow';
import Skeleton from '../../components/Loader/Skeleton';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { trending, popular, topRated, upcoming, nowPlaying, popularTV, topRatedTV } = useSelector(state => state.movies);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Fire the most important call first, the rest load progressively
    dispatch(fetchTrending({ timeWindow: 'week', page: 1 }));

    // Stagger other calls slightly to reduce backend pressure
    const timer1 = setTimeout(() => {
      dispatch(fetchPopularMovies(1));
      dispatch(fetchNowPlaying(1));
    }, 50);

    const timer2 = setTimeout(() => {
      dispatch(fetchPopularTV(1));
      dispatch(fetchTopRatedMovies(1));
    }, 100);

    const timer3 = setTimeout(() => {
      dispatch(fetchUpcomingMovies(1));
      dispatch(fetchTopRatedTV(1));
    }, 150);

    if (isAuthenticated) dispatch(fetchFavorites());

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [dispatch, isAuthenticated]);

  // Memoize rows to prevent unnecessary re-renders
  const rows = useMemo(() => [
    { data: trending, title: '🔥 Trending This Week', showMediaType: true },
    { data: nowPlaying, title: '🎬 Now Playing', link: '/explore/movie' },
    { data: popular, title: '🌟 Popular Movies', link: '/explore/movie' },
    { data: popularTV, title: '📺 Popular TV Shows', link: '/explore/tv' },
    { data: topRated, title: '⭐ Top Rated Movies', link: '/explore/movie' },
    { data: upcoming, title: '🎥 Upcoming Movies' },
    { data: topRatedTV, title: '🏆 Top Rated TV Shows', link: '/explore/tv' }
  ], [trending, nowPlaying, popular, popularTV, topRated, upcoming, topRatedTV]);

  return (
    <div className="home-page">
      {trending.results.length ? (
        <HeroBanner items={trending.results} />
      ) : (
        <div className="hero-placeholder" />
      )}

      <div className="home-content">
        {rows.map((row) => (
          row.data.results.length ? (
            <MovieRow
              key={row.title}
              title={row.title}
              items={row.data.results}
              link={row.link}
              showMediaType={row.showMediaType}
            />
          ) : (
            <Skeleton key={row.title} />
          )
        ))}
      </div>
    </div>
  );
};

export default React.memo(Home);
