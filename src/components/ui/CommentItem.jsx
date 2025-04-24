import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { updateComment, deleteComment } from '../../utils/supabaseClient.jsx';
import defaultAvatar from '../../assets/images/default-avatar.svg';

const CommentItem = ({ 
  comment, 
  onDelete = () => {}, 
  onUpdate = () => {} 
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric'
    }).format(date);
  };
  
  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    
    try {
      await updateComment(comment.id, editContent);
      onUpdate({ ...comment, content: editContent });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.id);
        onDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };
  
  const isOwner = user && comment.profile_id === user.id;
  
  return (
    <div className="border-b border-gray-800 py-4 last:border-none">
      <div className="flex items-start">
        <Link to={`/profile/${comment.profiles?.id}`} className="flex-shrink-0">
          <img 
            src={comment.profiles?.avatar_url || defaultAvatar} 
            alt={comment.profiles?.full_name || 'User'} 
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
        </Link>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <Link to={`/profile/${comment.profiles?.id}`} className="font-medium text-white hover:text-purple-400 transition-colors">
                {comment.profiles?.full_name || 'Anonymous'}
              </Link>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
            </div>
            
            {isOwner && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Edit comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleEdit} className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 min-h-[80px] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                placeholder="Edit your comment..."
                required
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-1 text-gray-300">
              {comment.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem; 