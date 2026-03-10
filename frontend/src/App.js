import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import supabase from './api/supabase';
import { setSession, logout } from './store/slices/authSlice';

// Layout Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import TrailerModal from './components/TrailerModal/TrailerModal';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home/Home';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import Explore from './pages/Explore/Explore';
import SearchResults from './pages/Search/SearchResults';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Favorites from './pages/Favorites/Favorites';
import WatchHistory from './pages/WatchHistory/WatchHistory';
import People from './pages/People/People';
import PersonDetail from './pages/PersonDetail/PersonDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminUsers from './pages/Admin/AdminUsers';
import NotFound from './pages/NotFound/NotFound';

const App = () => {
  const { theme } = useSelector(state => state.ui);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          dispatch(logout());
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Update token in localStorage when Supabase auto-refreshes
          localStorage.setItem('cineverse_token', session.access_token);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <TrailerModal />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/:type/:id" element={<MovieDetail />} />
        <Route path="/explore/:type" element={<Explore />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/people" element={<People />} />
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/favorites" element={
          <ProtectedRoute><Favorites /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><WatchHistory /></ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/movies" element={
          <AdminRoute><AdminMovies /></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><AdminUsers /></AdminRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
