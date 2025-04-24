import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../utils/AuthContext';
import { togglePostLike, togglePostSave } from '../../utils/supabaseClient.jsx';
import defaultAvatar from '../../assets/images/default-avatar.svg';

const PostCard = ({ 
  post, 
  isDetailed = false, 
  onDelete = null,
  animated = true 
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [saved, setSaved] = useState(post.user_has_saved || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await togglePostLike(post.id);
      setLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await togglePostSave(post.id);
      setSaved(result.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(post.id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const CardComponent = animated ? motion.article : 'article';
  
  return (
    <CardComponent
      className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-700/50 transition-all duration-300"
      variants={animated ? cardVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      <Link to={`/posts/${post.id}`} className="block">
        {/* Post Header */}
        <div className="p-4">
          <div className="flex items-center mb-3">
            <Link 
              to={`/profile/${post.profile_id}`} 
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={post.author_avatar || post.profile?.avatar_url || defaultAvatar} 
                alt={post.author_name || post.profile?.full_name || 'User'} 
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <h3 className="text-white font-medium">{post.author_name || post.profile?.full_name || 'Anonymous'}</h3>
                <p className="text-gray-400 text-sm">{formatDate(post.created_at)}</p>
              </div>
            </Link>
          </div>
          
          {/* Post Title */}
          <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
          
          {/* Post Type Badge */}
          {post.post_type && (
            <div className="inline-block bg-purple-900/40 text-purple-200 border border-purple-700/50 px-2 py-1 rounded text-xs mb-3">
              {post.post_type}
            </div>
          )}
          
          {/* Post Content Preview */}
          <div className="text-gray-300 mb-4">
            {isDetailed ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p className="line-clamp-3">{post.content.replace(/<[^>]*>?/gm, '')}</p>
            )}
          </div>
          
          {/* Post Media */}
          {((post.media && post.media.length > 0) || (post.images && post.images.length > 0)) && (
            <div className="mb-4">
              <img 
                src={(post.media && post.media.length > 0) ? post.media[0].url : post.images[0]} 
                alt="Post media" 
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
        </div>
        
        {/* Post Footer */}
        <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center bg-gray-900/70">
          <div className="flex space-x-4">
            {/* Like Button */}
            <button 
              onClick={handleLike}
              className={`flex items-center text-sm ${liked ? 'text-purple-400' : 'text-gray-400 hover:text-white'} transition-colors`}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-1.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>
            
            {/* Comment Button */}
            <Link 
              to={`/posts/${post.id}#comments`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comment_count || 0}</span>
            </Link>
          </div>
          
          <div className="flex space-x-3">
            {/* Save Button */}
            <button 
              onClick={handleSave}
              className={`${saved ? 'text-yellow-400' : 'text-gray-400 hover:text-white'} transition-colors`}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            
            {/* Delete Button (only for post owner) */}
            {user && post.profile_id === user.id && onDelete && (
              <button 
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </Link>
    </CardComponent>
  );
};

export default PostCard; 