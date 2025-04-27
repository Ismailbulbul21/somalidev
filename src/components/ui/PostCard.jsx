import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../../utils/AuthContext';
import { likePost, unlikePost, savePost, unsavePost } from '../../utils/supabaseClient.jsx';
import TagsInput from './TagsInput';
import { toast } from 'react-hot-toast';
import { ChatBubbleLeftIcon, QuestionMarkCircleIcon, CodeBracketIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../utils/supabaseClient.jsx';

const PostCard = ({ post, onDelete, onPostUpdated }) => {
  // Defensive data handling for post prop
  if (!post) return null;
  
  // Create persistent refs for media URL and category data to prevent them from disappearing
  const mediaUrlRef = useRef(post.media_url || post._media_url || null);
  const categoryDataRef = useRef(post.categories || post._categories || null);
  
  // Ensure we have a valid category name that persists
  const categoryName = categoryDataRef.current?.name || 
                      (typeof categoryDataRef.current === 'string' ? categoryDataRef.current : 'General');
  
  // Debug output for media and category
  console.log(`PostCard: media_url=${mediaUrlRef.current}, category=${JSON.stringify(categoryDataRef.current)}`);
  
  // Rest of state setup
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
  const [likes, setLikes] = useState(post.like_count || 0);
  const [isSaved, setIsSaved] = useState(post.user_has_saved || false);
  const [mediaUrl, setMediaUrl] = useState(mediaUrlRef.current);
  const [categoryData, setCategoryData] = useState(categoryDataRef.current);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize data on mount
  useEffect(() => {
    // Set initial values with fallbacks
    if (!mediaUrl && mediaUrlRef.current) {
      setMediaUrl(mediaUrlRef.current);
    }
    
    if (!categoryData && categoryDataRef.current) {
      setCategoryData(categoryDataRef.current);
    }
    
    console.log('PostCard mounted for:', post.id);
  }, []);
  
  // Update refs when post changes to prevent data loss
  useEffect(() => {
    // Always preserve media_url in ref if it exists
    if (post.media_url || post._media_url) {
      mediaUrlRef.current = post.media_url || post._media_url;
      setMediaUrl(mediaUrlRef.current);
    }
    
    // Always preserve categories in ref if they exist
    if (post.categories || post._categories) {
      categoryDataRef.current = post.categories || post._categories;
      setCategoryData(categoryDataRef.current);
    }
    
    console.log('PostCard effect: Updated refs with:', { 
      mediaUrl: mediaUrlRef.current, 
      category: categoryDataRef.current 
    });
    
    // Additional check: if post has category_id but no categories object,
    // try to fetch the category details from the API
    if (post.category_id && !post.categories && !categoryDataRef.current) {
      const fetchCategory = async () => {
        try {
          const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('id', post.category_id)
            .single();
            
          if (data) {
            console.log(`Fetched missing category data for post ${post.id}:`, data);
            categoryDataRef.current = data;
            setCategoryData(data);
          }
        } catch (error) {
          console.error('Error fetching category data:', error);
        }
      };
      
      fetchCategory();
    }
  }, [post]);
  
  // Debugging effect to monitor state/ref changes
  useEffect(() => {
    console.log('PostCard state updated:', { 
      mediaUrl, 
      categoryData,
      isLiked,
      isSaved,
      likes
    });
  }, [mediaUrl, categoryData, isLiked, isSaved, likes]);
  
  // Check if the user is the author of the post
  const isAuthor = user && post.profile_id === user.id;
  
  // Get formatted date
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  // Log which post rendered and its media/category data
  console.log(`Rendering PostCard for ${post.id}:`, {
    hasMedia: !!mediaUrl,
    mediaSource: mediaUrl || 'none',
    hasCategory: !!categoryData,
    categoryName: categoryName
  });
  
  // Handle like toggling
  const handleLikeToggle = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
      } else {
        await likePost(post.id);
        setIsLiked(true);
        setLikes(prev => prev + 1);
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
      if (isSaved) {
        await unsavePost(post.id);
        setIsSaved(false);
        toast.success('Post removed from saved items');
      } else {
        await savePost(post.id);
        setIsSaved(true);
        toast.success('Post saved to your profile');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save status');
    }
  };
  
  // Function to determine post type icon
  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'discussion': return <ChatBubbleLeftIcon className="h-5 w-5" />;
      case 'question': return <QuestionMarkCircleIcon className="h-5 w-5" />;
      case 'project': return <CodeBracketIcon className="h-5 w-5" />;
      case 'article': return <DocumentTextIcon className="h-5 w-5" />;
      case 'resource': return <LinkIcon className="h-5 w-5" />;
      default: return <ChatBubbleLeftIcon className="h-5 w-5" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl overflow-hidden hover:border-indigo-600/40 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10"
    >
      {/* Post Header - More modern design */}
      <div className="p-4 sm:p-5 flex items-start">
        {/* Author Avatar */}
        <div className="flex-shrink-0 mr-3 sm:mr-4">
          <Link to={`/profile/${post.profiles?.username || post.user_id || post.profile_id}`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-700 to-purple-700 rounded-full overflow-hidden ring-2 ring-indigo-500/20">
              {post.author_avatar || post.profiles?.avatar_url ? (
                <img 
                  src={post.author_avatar || post.profiles?.avatar_url}
                  alt={post.author_name || post.profiles?.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-medium">
                  {post.author_name?.[0]?.toUpperCase() || post.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </Link>
        </div>
        
        {/* Post Info */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center">
            {/* Author and Category */}
            <div className="flex flex-wrap items-center mr-2 pr-2">
              <Link 
                to={`/profile/${post.profiles?.username || post.user_id || post.profile_id}`}
                className="font-semibold text-white hover:text-indigo-300 transition-colors truncate max-w-[150px] sm:max-w-full"
              >
                {post.author_name || post.profiles?.full_name || 'Anonymous User'}
              </Link>
              
              {/* Show Category - Using the persistent reference */}
              {categoryData ? (
                <div className="inline-flex items-center text-xs text-indigo-300 ml-2 gap-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="truncate max-w-[80px] sm:max-w-[150px]">{categoryName}</span>
                </div>
              ) : categoryDataRef.current ? (
                // Fallback to ref if state is missing
                <div className="inline-flex items-center text-xs text-indigo-300 ml-2 gap-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="truncate max-w-[80px] sm:max-w-[150px]">
                    {categoryDataRef.current?.name || 
                     (typeof categoryDataRef.current === 'string' ? categoryDataRef.current : 'General')}
                  </span>
                </div>
              ) : post.category_id ? (
                // Another fallback using just the ID
                <div className="inline-flex items-center text-xs text-indigo-300 ml-2 gap-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="truncate max-w-[80px] sm:max-w-[150px]">Category</span>
                </div>
              ) : null}
            </div>
            
            {/* Time */}
            <div className="ml-auto text-xs text-gray-400 flex-shrink-0">
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
      
      {/* Post Content - More refined spacing */}
      <div className="px-4 sm:px-5 pb-3">
        <Link to={`/community/post/${post.id}`} className="hover:text-indigo-300 transition-colors block">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2.5">{post.title}</h3>
        </Link>
        
        {/* Content Preview */}
        <div className="text-gray-300 text-sm sm:text-base mb-4 line-clamp-3">
          {post.content}
        </div>
        
        {/* Post Image - Using persistent mediaUrl state */}
        {mediaUrl && (
          <Link to={`/community/post/${post.id}`} className="block mb-4">
            <div className="relative rounded-lg overflow-hidden h-48 sm:h-64 bg-gray-900">
              <img 
                src={mediaUrl} 
                alt={post.title} 
                className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-300"
                onError={(e) => {
                  console.error('Image failed to load:', mediaUrl);
                  // If the image fails to load, try using the backup URL if available
                  if (post._media_url && post._media_url !== mediaUrl) {
                    console.log('Trying backup media URL:', post._media_url);
                    setMediaUrl(post._media_url);
                    e.target.src = post._media_url;
                  } else if (mediaUrlRef.current && mediaUrlRef.current !== mediaUrl) {
                    // If even the backup URL fails, try the ref value
                    console.log('Trying ref media URL:', mediaUrlRef.current);
                    setMediaUrl(mediaUrlRef.current);
                    e.target.src = mediaUrlRef.current;
                  } else {
                    // If all else fails, hide the image container
                    e.target.closest('.relative').style.display = 'none';
                  }
                }}
              />
            </div>
          </Link>
        )}
        
        {/* Tags - Better styling */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4">
            <TagsInput 
              tags={post.tags} 
              readOnly={true}
              className="text-xs sm:text-sm"
            />
          </div>
        )}
      </div>
      
      {/* Actions Bar - More polished */}
      <div className="px-3 sm:px-5 py-3 border-t border-gray-700/50 flex items-center flex-wrap">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className={`mr-4 sm:mr-5 flex items-center rounded-lg text-sm px-2.5 py-1.5 ${
            isLiked 
              ? 'text-indigo-300 hover:text-indigo-200 bg-indigo-900/30' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          } transition-all duration-200`}
        >
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 ${isLiked ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" 
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
            />
          </svg>
          <span>{likes > 0 ? likes : 'Like'}</span>
        </button>
        
        {/* Comment Button */}
        <Link
          to={`/community/post/${post.id}`}
          className="mr-4 sm:mr-5 flex items-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg text-sm px-2.5 py-1.5 transition-all duration-200"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comment_count > 0 ? post.comment_count : 'Comment'}</span>
        </Link>
        
        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          className={`mr-4 sm:mr-5 flex items-center rounded-lg text-sm px-2.5 py-1.5 ${
            isSaved 
              ? 'text-indigo-300 hover:text-indigo-200 bg-indigo-900/30' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          } transition-all duration-200`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        
        {/* View Count */}
        {post.view_count > 0 && (
          <div className="ml-auto text-gray-400 text-xs sm:text-sm flex items-center">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.view_count}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard; 