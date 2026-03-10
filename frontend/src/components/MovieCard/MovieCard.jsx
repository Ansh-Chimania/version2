import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlay, FiHeart, FiStar } from 'react-icons/fi';
import { getPosterUrl, getTitle, getReleaseDate, formatYear, formatRating, getMediaType } from '../../utils/helpers';
import { addFavorite, removeFavorite } from '../../store/slices/favoriteSlice';
import './MovieCard.css';

const MovieCard = ({ item, showMediaType = false }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: favorites } = useSelector(state => state.favorites);
  const { isAuthenticated } = useSelector(state => state.auth);

  if (!item) return null;

  const mediaType = getMediaType(item);
  const title = getTitle(item);
  const year = formatYear(getReleaseDate(item));
  const rating = formatRating(item.vote_average);
  const posterUrl = getPosterUrl(item.poster_path || item.profile_path);
  const isFavorite = favorites.some(f => f.tmdbId === item.id);

  const handleClick = () => {
    if (mediaType === 'person') {
      navigate(`/person/${item.id}`);
    } else {
      navigate(`/${mediaType}/${item.id}`);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    if (isFavorite) {
      dispatch(removeFavorite(item.id));
    } else {
      dispatch(addFavorite({
        tmdbId: item.id,
        title,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        rating: item.vote_average,
        releaseDate: getReleaseDate(item),
        mediaType,
        overview: item.overview
      }));
    }
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="card-poster">
        {!imgLoaded && !imgError && <div className="card-skeleton" />}
        <img
          src={imgError ? getPosterUrl(null) : posterUrl}
          alt={title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />

        <div className="card-overlay">
          <button className="card-play-btn">
            <FiPlay />
          </button>
        </div>

        {mediaType !== 'person' && (
          <button
            className={`card-fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
          >
            <FiHeart />
          </button>
        )}

        {rating !== 'N/A' && mediaType !== 'person' && (
          <div className="card-rating">
            <FiStar /> {rating}
          </div>
        )}

        {showMediaType && (
          <span className="card-media-badge">
            {mediaType === 'tv' ? 'TV' : mediaType === 'person' ? 'Person' : 'Movie'}
          </span>
        )}
      </div>

      <div className="card-info">
        <h3 className="card-title">{title}</h3>
        {year && <span className="card-year">{year}</span>}
      </div>
    </div>
  );
};

export default React.memo(MovieCard);
