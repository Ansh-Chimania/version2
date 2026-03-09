const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const favoriteRoutes = require('./routes/favorites');
const watchHistoryRoutes = require('./routes/watchHistory');
const adminRoutes = require('./routes/admin');
const tmdbRoutes = require('./routes/tmdb');

const app = express();

// Connect Database
connectDB();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: ['https://version2-jri3.onrender.com'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tmdb', tmdbRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'CineVerse API is running', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎬 CineVerse Server running on port ${PORT}`);
});
