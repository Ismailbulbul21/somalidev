import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiLink, FiEdit3, FiX, FiArrowLeft, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import { useAuth } from '../../utils/AuthContext';
import { createPost, updatePost, getCategories } from '../../utils/supabaseClient.jsx';
import TagsInput from './TagsInput';
import MediaUpload from './MediaUpload';

const PostForm = ({ 
  initialData = null, 
  preSelectedCategory = null, 
  onSuccess = null,
  onCancel = null,
  simplified = false
}) => {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [postType, setPostType] = useState(initialData?.post_type || 'discussion');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || preSelectedCategory || '');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(initialData?.media_url || null);
  
  // UI state
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [expanded, setExpanded] = useState(!!initialData || !simplified);
  const [step, setStep] = useState(1);
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Set preselected category if provided
  useEffect(() => {
    if (preSelectedCategory) {
      setCategoryId(preSelectedCategory);
    }
  }, [preSelectedCategory]);
  
  // Update character count when content changes
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);
  
  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate form - make sure to properly trim and check title
    const trimmedTitle = title ? title.trim() : '';
    const trimmedContent = content ? content.trim() : '';
    
    if (!trimmedTitle) {
      setError('Please enter a title');
      return;
    }
    
    if (!trimmedContent) {
      setError('Please enter some content');
      return;
    }
    
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('content', trimmedContent);
      formData.append('post_type', postType);
      formData.append('category_id', categoryId);
      
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      
      // Either create a new post or update an existing one
      let result;
      if (initialData) {
        result = await updatePost(initialData.id, formData);
        toast.success('Post updated successfully!');
      } else {
        result = await createPost(formData);
        toast.success('Post created successfully!');
      }
      
      // Reset form
      if (!initialData) {
        setTitle('');
        setContent('');
        setTags([]);
        setMediaFile(null);
        setMediaPreview(null);
        setExpanded(false);
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel form
  const handleCancel = () => {
    // Reset form state if not editing
    if (!initialData) {
      setTitle('');
      setContent('');
      setTags([]);
      setPostType('discussion');
      setMediaFile(null);
      setMediaPreview(null);
      setExpanded(false);
    }
    
    // Call cancel callback
    if (onCancel) {
      onCancel();
    }
  };
  
  // Post type options
  const postTypes = [
    { id: 'discussion', label: 'Discussion', icon: <FiEdit3 /> },
    { id: 'question', label: 'Question', icon: <FiCode /> },
    { id: 'resource', label: 'Resource', icon: <FiLink /> },
    { id: 'article', label: 'Article', icon: <FiEdit3 /> },
    { id: 'project', label: 'Project', icon: <FiCode /> }
  ];
  
  if (!user) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">Please sign in to create a post</p>
      </div>
    );
  }
  
  if (simplified && !expanded) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-6">
        <div 
          className="p-4 flex items-center cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden mr-3">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-medium">
                {user.user_metadata?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-grow bg-gray-800 rounded-full px-4 py-2.5 text-gray-400 hover:bg-gray-750 transition-colors">
            What's on your mind?
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-6"
      >
        <div className="p-4">
          {/* Form Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {initialData ? 'Edit Post' : 'Create Post'}
            </h3>
            {(onCancel || simplified) && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-white p-1 rounded-full transition-colors"
              >
                {simplified ? <FiX size={20} /> : <FiArrowLeft size={20} />}
              </button>
            )}
          </div>
          
          {/* Post Form */}
          <form onSubmit={handleSubmit}>
            {/* Post Type Selection */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Post Type
              </label>
              <div className="grid grid-cols-5 gap-2">
                {postTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      postType === type.id
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750'
                    }`}
                  >
                    <span className="text-xl mb-1">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category Selection */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-400 text-sm mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Post Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-400 text-sm mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write a descriptive title..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>
            
            {/* Post Content */}
            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-400 text-sm mb-2">
                Content
              </label>
              <div className="relative">
                <TextareaAutosize
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  minRows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none"
                  required
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {charCount > 0 && `${charCount} characters`}
                </div>
              </div>
            </div>
            
            {/* Media Upload */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Media (optional)
              </label>
              <MediaUpload
                mediaFile={mediaFile}
                setMediaFile={setMediaFile}
                mediaPreview={mediaPreview}
                setMediaPreview={setMediaPreview}
              />
            </div>
            
            {/* Tags Input */}
            <div className="mb-4">
              <label htmlFor="tags" className="block text-gray-400 text-sm mb-2">
                Tags (optional)
              </label>
              <TagsInput
                tags={tags}
                setTags={setTags}
                placeholder="Add tags (press Enter after each tag)"
                className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    <span>{initialData ? 'Update Post' : 'Publish Post'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostForm; 