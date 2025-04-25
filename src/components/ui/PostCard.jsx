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
    
    if (isLoading || !user) return;
    
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
    
    if (isLoading || !user) return;
    
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

  // Get time since post creation
  const getTimeSince = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const then = new Date(dateStr);
    const secondsAgo = Math.floor((now - then) / 1000);
    
    if (secondsAgo < 60) return 'just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 86400)}d ago`;
    return formatDate(dateStr);
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

  // Get appropriate icon for post type
  const getPostTypeIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'question':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'resource':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default: // discussion
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  const CardComponent = animated ? motion.article : 'article';
  
  return (
    <CardComponent
      className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500/30 hover:shadow-md hover:shadow-purple-500/10 transition-all duration-300"
      variants={animated ? cardVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      <Link to={`/posts/${post.id}`} className="block">
        {/* Post Header with Author Info */}
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <Link 
              to={`/profile/${post.profile_id}`} 
              className="flex items-center group"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={post.author_avatar || post.profile?.avatar_url || defaultAvatar} 
                alt={post.author_name || post.profile?.full_name || 'User'} 
                className="w-10 h-10 rounded-full mr-3 object-cover ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all"
              />
              <div>
                <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">{post.author_name || post.profile?.full_name || 'Anonymous'}</h3>
                <p className="text-gray-400 text-xs flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {getTimeSince(post.created_at)}
                </p>
              </div>
            </Link>

            {/* Post Type Badge */}
            {post.post_type && (
              <div className="flex items-center bg-purple-900/30 text-purple-300 border border-purple-800/50 px-2.5 py-1 rounded-full text-xs">
                {getPostTypeIcon(post.post_type)}
                <span>{post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {/* Post Title */}
          <h2 className="text-xl font-semibold text-white mb-3 hover:text-purple-400 transition-colors">{post.title}</h2>
          
          {/* Category Badge */}
          {post.category && (
            <div className="inline-block bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-full text-xs mb-3">
              {post.category.name || post.category_id}
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
                className="w-full h-48 object-cover rounded-md border border-gray-800"
              />
            </div>
          )}
        </div>
        
        {/* Post Footer with Actions */}
        <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center bg-gray-800/30">
          <div className="flex space-x-4">
            {/* Like Button */}
            <button 
              onClick={handleLike}
              className={`flex items-center text-sm rounded-full px-2 py-1 transition-colors ${
                liked 
                  ? 'text-white bg-purple-600/30 border border-purple-500/50' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/80 border border-transparent'
              }`}
              title={user ? (liked ? 'Unlike' : 'Like') : 'Sign in to like posts'}
              disabled={isLoading || !user}
            >
              <svg className="w-4 h-4 mr-1.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>
            
            {/* Comment Button */}
            <Link 
              to={`/posts/${post.id}#comments`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-sm text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-full px-2 py-1 transition-colors border border-transparent"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comment_count || 0}</span>
            </Link>
          </div>
          
          <div className="flex space-x-3">
            {/* Save Button */}
            <button 
              onClick={handleSave}
              className={`flex items-center rounded-full p-1.5 transition-colors ${
                saved 
                  ? 'text-yellow-400 bg-yellow-900/20 border border-yellow-700/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/80 border border-transparent'
              }`}
              title={user ? (saved ? 'Unsave' : 'Save for later') : 'Sign in to save posts'}
              disabled={isLoading || !user}
            >
              <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            
            {/* Delete Button (only for post owner) */}
            {user && post.profile_id === user.id && onDelete && (
              <button 
                onClick={handleDelete}
                className="flex items-center rounded-full p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-700/30"
                title="Delete post"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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