import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../../utils/AuthContext';
import { likePost, unlikePost, deletePost, savePost, unsavePost } from '../../utils/supabaseClient.jsx';
import TagsInput from './TagsInput';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [saved, setSaved] = useState(post.user_has_saved || false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleLikeToggle = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    try {
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };
  
  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    try {
      if (saved) {
        await unsavePost(post.id);
        setSaved(false);
        toast.success('Post removed from saved items');
      } else {
        await savePost(post.id);
        setSaved(true);
        toast.success('Post saved to your profile');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save status');
    }
  };
  
  const handleDeleteClick = async () => {
    if (confirmDelete) {
      setIsDeleting(true);
      try {
        await deletePost(post.id);
        toast.success('Post deleted successfully');
        if (onDelete) onDelete(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      } finally {
        setIsDeleting(false);
        setConfirmDelete(false);
      }
    } else {
      setConfirmDelete(true);
      // Auto reset confirm state after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };
  
  const canDelete = user && (
    user.id === post.user_id || 
    (user.user_metadata && user.user_metadata.role === 'admin')
  );
  
  // Format the date
  const getTimeSince = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };
  
  // Get post type icon
  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'discussion':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'question':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'resource':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all"
    >
      {/* Post Header */}
      <div className="p-4 flex items-start">
        {/* Author Avatar */}
        <div className="flex-shrink-0 mr-3">
          <Link to={`/profile/${post.profiles?.username || post.user_id}`}>
            <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden">
              {post.profiles?.avatar_url ? (
                <img 
                  src={post.profiles.avatar_url} 
                  alt={post.profiles.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
                  {post.profiles?.full_name ? post.profiles.full_name[0].toUpperCase() : '?'}
                </div>
              )}
            </div>
          </Link>
        </div>
        
        {/* Post Info */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-center">
            {/* Author and Post Type */}
            <div>
              <Link 
                to={`/profile/${post.profiles?.username || post.user_id}`}
                className="font-medium text-white hover:text-purple-400 transition-colors mr-2"
              >
                {post.profiles?.full_name || 'Anonymous User'}
              </Link>
              
              {/* Post Type Badge */}
              {post.post_type && (
                <span className="inline-flex items-center text-xs text-gray-400 mx-1 gap-0.5">
                  {getPostTypeIcon(post.post_type)}
                  <span className="capitalize">{post.post_type}</span>
                </span>
              )}
            </div>
            
            {/* Category Badge */}
            {post.category && (
              <Link
                to={`/community/category/${post.category.id}`}
                className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-800 text-purple-400 hover:bg-gray-750 hover:text-purple-300 transition-colors"
              >
                {post.category.name}
              </Link>
            )}
          </div>
          
          {/* Post Time */}
          <div className="text-xs text-gray-500 mt-1">{getTimeSince(post.created_at)}</div>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-2">
        <Link to={`/community/post/${post.id}`} className="hover:text-purple-400 transition-colors">
          <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
        </Link>
        
        {/* Content Preview */}
        <div className="text-gray-300 mb-4 line-clamp-3">
          {post.content}
        </div>
        
        {/* Post Image */}
        {post.media_url && (
          <Link to={`/community/post/${post.id}`} className="block mb-4">
            <div className="relative rounded-lg overflow-hidden aspect-video">
              <img 
                src={post.media_url} 
                alt={post.title} 
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>
          </Link>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4">
            <TagsInput 
              tags={post.tags} 
              readOnly={true}
              className="text-sm"
            />
          </div>
        )}
      </div>
      
      {/* Actions Bar */}
      <div className="px-4 py-2 border-t border-gray-800 flex items-center">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className={`mr-4 flex items-center rounded-md text-sm px-2 py-1 ${
            liked 
              ? 'text-purple-400 hover:text-purple-300' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className={`w-5 h-5 mr-1.5 ${liked ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" 
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
            />
          </svg>
          <span>{likeCount > 0 ? likeCount : 'Like'}</span>
        </button>
        
        {/* Comment Button */}
        <Link
          to={`/community/post/${post.id}`}
          className="mr-4 flex items-center text-gray-400 hover:text-white rounded-md text-sm px-2 py-1"
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comment_count > 0 ? post.comment_count : 'Comment'}</span>
        </Link>
        
        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          className={`mr-4 flex items-center rounded-md text-sm px-2 py-1 ${
            saved 
              ? 'text-purple-400 hover:text-purple-300' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5 mr-1.5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
        
        {/* View Count */}
        {post.view_count > 0 && (
          <div className="ml-auto text-gray-500 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.view_count}
          </div>
        )}
        
        {/* Delete Button (for post owner or admin) */}
        {canDelete && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={`ml-2 p-1.5 rounded-full ${
              confirmDelete
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
            title={confirmDelete ? "Click again to confirm" : "Delete post"}
          >
            {isDeleting ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard; 