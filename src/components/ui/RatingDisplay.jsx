import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { format } from 'date-fns';

/**
 * Component to display star ratings
 */
export const StarRating = ({ rating, size = 'md' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };
  
  const className = `text-yellow-400 ${sizeClasses[size] || sizeClasses.md}`;
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className={className} />
      ))}
      
      {hasHalfStar && <FaStarHalfAlt className={className} />}
      
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className={className} />
      ))}
    </div>
  );
};

/**
 * Component to display a single rating from a user
 */
export const RatingItem = ({ rating }) => {
  const formattedDate = format(
    new Date(rating.created_at),
    'MMM d, yyyy'
  );
  
  // Handle missing rater data gracefully
  const rater = rating.rater || { 
    id: 'unknown',
    full_name: 'Unknown User',
    avatar_url: null,
    title: ''
  };
  
  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        {/* User Avatar/Info */}
        <div className="flex-shrink-0 mr-4">
          <Link to={`/profile/${rater.id}`} className="block">
            {rater.avatar_url ? (
              <img 
                src={rater.avatar_url} 
                alt={rater.full_name} 
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-lg font-bold border-2 border-gray-700">
                {rater.full_name?.charAt(0) || '?'}
              </div>
            )}
          </Link>
        </div>
        
        {/* Rating Content */}
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-center mb-2">
            <div>
              <Link 
                to={`/profile/${rater.id}`}
                className="font-medium text-white hover:text-purple-400 transition-colors"
              >
                {rater.full_name}
              </Link>
              <div className="flex items-center mt-1">
                <StarRating rating={rating.rating_value} size="sm" />
                <span className="text-sm text-gray-400 ml-2">
                  {rating.rating_value} star{rating.rating_value !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
          
          {rating.comment && (
            <p className="text-gray-300 text-sm mt-2">{rating.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Component to display overall rating stats
 */
export const RatingSummary = ({ ratings }) => {
  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400">No ratings yet</p>
      </div>
    );
  }
  
  // Calculate average rating
  const totalRating = ratings.reduce((sum, rating) => sum + rating.rating_value, 0);
  const averageRating = totalRating / ratings.length;
  
  return (
    <div className="text-center py-2">
      <div className="flex justify-center mb-1">
        <StarRating rating={averageRating} size="lg" />
      </div>
      <div className="flex items-center justify-center">
        <span className="text-xl font-bold mr-2">{averageRating.toFixed(1)}</span>
        <span className="text-gray-400">({ratings.length} rating{ratings.length !== 1 ? 's' : ''})</span>
      </div>
    </div>
  );
};

/**
 * Main component that shows all ratings for a user
 */
const RatingDisplay = ({ ratings, showSummary = true }) => {
  if (!ratings) return null;
  
  return (
    <div>
      {showSummary && <RatingSummary ratings={ratings} />}
      
      <div className="mt-4">
        {ratings.length > 0 ? (
          ratings.map(rating => (
            <RatingItem key={rating.id} rating={rating} />
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No ratings yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingDisplay; 