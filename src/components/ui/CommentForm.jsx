import React, { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { addComment } from '../../utils/supabaseClient.jsx';

const CommentForm = ({ 
  postId, 
  onSuccess = () => {} 
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add a comment');
      return;
    }
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const newComment = {
        post_id: postId,
        profile_id: user.id,
        content: content.trim()
      };
      
      const result = await addComment(newComment);
      setContent('');
      onSuccess(result);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Error adding comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">
          Please <a href="/signin" className="text-purple-400 hover:text-purple-300">sign in</a> to add a comment.
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <h3 className="text-white font-medium mb-3">Add a Comment</h3>
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-white p-3 rounded-md mb-3">
          {error}
        </div>
      )}
      
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-3 min-h-[100px] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          placeholder="Write your comment here..."
          required
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md transition-colors flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 