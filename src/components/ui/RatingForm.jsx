import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { createOrUpdateRating, getUserRatingFor } from '../../utils/supabaseClient.jsx';
import { useAuth } from '../../utils/AuthContext';

const RatingForm = ({ 
  userId, 
  onRatingSubmitted = () => {}, 
  onCancel = () => {},
  small = false 
}) => {
  const { user } = useAuth();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    // Check if user has already rated this profile
    const checkExistingRating = async () => {
      if (user && userId) {
        try {
          const rating = await getUserRatingFor(user.id, userId);
          if (rating) {
            setExistingRating(rating);
            setSelectedRating(rating.rating_value);
            setComment(rating.comment || '');
          }
        } catch (error) {
          console.error('Error fetching existing rating:', error);
        }
      }
    };

    checkExistingRating();
  }, [user, userId]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedRating === 0) {
      setError('Please select a rating.');
      return;
    }
    
    if (!user || !userId) {
      setError('You must be logged in to rate users.');
      return;
    }

    try {
      setLoading(true);
      await createOrUpdateRating(
        user.id,
        userId,
        selectedRating,
        comment
      );
      
      onRatingSubmitted();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className={`bg-gray-800 border border-gray-700 rounded-lg ${small ? 'p-4' : 'p-6'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className={`${small ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>
        {existingRating ? 'Update Your Rating' : 'Rate This Developer'}
      </h3>

      <form onSubmit={handleRatingSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <label className="text-sm text-gray-300 mr-2">Your Rating:</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className="text-2xl focus:outline-none transition-colors mr-1"
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setSelectedRating(rating)}
                >
                  <FaStar
                    className={`${
                      (hoveredRating || selectedRating) >= rating
                        ? 'text-yellow-400'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-300">
              {selectedRating > 0 && `(${selectedRating} star${selectedRating !== 1 ? 's' : ''})`}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm text-gray-300 mb-1">
            Comment (Optional):
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={small ? 2 : 3}
            placeholder="Share your experience working with this developer..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-400 text-sm">{error}</div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              existingRating ? 'Update Rating' : 'Submit Rating'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RatingForm; 