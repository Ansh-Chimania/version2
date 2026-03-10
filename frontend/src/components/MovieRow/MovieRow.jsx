import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MovieCard from '../MovieCard/MovieCard';
import useLazyLoad from '../../hooks/useLazyLoad';
import './MovieRow.css';

const MovieRow = ({ title, items = [], link, showMediaType = false }) => {
  const rowRef = useRef(null);
  const [sectionRef, isVisible] = useLazyLoad();
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.offsetWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items.length) return null;

  return (
    <section className="movie-row" ref={sectionRef}>
      <div className="row-header container">
        <h2 className="section-title">
          {title}
          {link && (
            <span className="see-all" onClick={() => navigate(link)}>
              See All →
            </span>
          )}
        </h2>
      </div>

      {isVisible && (
        <div className="row-slider-wrapper">
          <button className="row-arrow left" onClick={() => scroll('left')}>
            <FiChevronLeft />
          </button>

          <div className="row-slider" ref={rowRef}>
            {items.map((item, idx) => (
              <MovieCard key={`${item.id}-${idx}`} item={item} showMediaType={showMediaType} />
            ))}
          </div>

          <button className="row-arrow right" onClick={() => scroll('right')}>
            <FiChevronRight />
          </button>
        </div>
      )}
    </section>
  );
};

export default React.memo(MovieRow);
