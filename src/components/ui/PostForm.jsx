import React, { useState, useEffect } from 'react';
import { createPost, updatePost, addPostMedia, getCategories } from '../../utils/supabaseClient.jsx';
import { useAuth } from '../../utils/AuthContext';
import { motion } from 'framer-motion';

const PostForm = ({ 
  post = null, 
  onSuccess = () => {}, 
  onCancel = () => {},
  preSelectedCategory = null 
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [postType, setPostType] = useState(post?.post_type || 'discussion');
  const [categoryId, setCategoryId] = useState(post?.category_id || preSelectedCategory || '');
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const result = await getCategories();
        // If no categories returned from the database, use default fallback categories
        if (!result || result.length === 0) {
          console.log('No categories found, using fallback categories');
          const fallbackCategories = [
            { id: 'web-dev', name: 'Web Development', description: 'Development of websites and web applications' },
            { id: 'mobile-dev', name: 'Mobile Development', description: 'Development of applications for mobile devices' },
            { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and user experience design' },
            { id: 'data-science', name: 'Data Science', description: 'Analysis and interpretation of complex data' },
            { id: 'ml-ai', name: 'Machine Learning', description: 'Artificial intelligence and machine learning' },
            { id: 'game-dev', name: 'Game Development', description: 'Development of video games and interactive applications' },
            { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protection of systems, networks, and programs from digital attacks' },
          ];
          setCategories(fallbackCategories);
        } else {
          setCategories(result || []);
        }
        
        // If editing a post and we have its category_id, pre-select it
        if (post?.category_id && result) {
          setCategoryId(post.category_id);
        } else if (preSelectedCategory) {
          setCategoryId(preSelectedCategory);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
        
        // Use fallback categories even on error
        console.log('Error fetching categories, using fallback categories');
        const fallbackCategories = [
          { id: 'web-dev', name: 'Web Development', description: 'Development of websites and web applications' },
          { id: 'mobile-dev', name: 'Mobile Development', description: 'Development of applications for mobile devices' },
          { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and user experience design' },
          { id: 'data-science', name: 'Data Science', description: 'Analysis and interpretation of complex data' },
          { id: 'ml-ai', name: 'Machine Learning', description: 'Artificial intelligence and machine learning' },
          { id: 'game-dev', name: 'Game Development', description: 'Development of video games and interactive applications' },
          { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protection of systems, networks, and programs from digital attacks' },
        ];
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [post?.category_id, preSelectedCategory]);

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return null;
    const name = categoryName.toLowerCase();
    
    if (name.includes('web')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    } else if (name.includes('mobile')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (name.includes('back')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      );
    } else if (name.includes('data')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    } else if (name.includes('design')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create or edit posts');
      return;
    }
    
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const postData = {
        title,
        content,
        post_type: postType,
        category_id: categoryId,
        profile_id: user.id
      };
      
      // Either update existing post or create new one
      let result;
      if (post?.id) {
        result = await updatePost(post.id, postData);
      } else {
        result = await createPost(postData);
      }
      
      // Upload media if selected - make this optional
      if (media && result) {
        try {
          await addPostMedia(result.id, media);
        } catch (mediaError) {
          console.error('Error uploading media, but post was created:', mediaError);
          // Continue despite media upload error
          // Just show a message in the console but don't block post creation
        }
      }
      
      onSuccess(result);
    } catch (error) {
      console.error('Error submitting post:', error);
      setError(error.message || 'Error submitting post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  // Single-step form with integrated category selection
  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="bg-gray-900 border border-gray-800 rounded-lg p-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-semibold text-white mb-4">
        {post ? 'Edit Post' : 'Create New Post'}
      </h2>
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-gray-300 mb-2">
            Title*
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            placeholder="Post title"
            required
          />
        </div>
        
        {/* Post Type Selection */}
        <div>
          <label htmlFor="postType" className="block text-gray-300 mb-2">
            Post Type*
          </label>
          <select
            id="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            required
          >
            <option value="discussion">Discussion</option>
            <option value="question">Question</option>
            <option value="project">Project Showcase</option>
            <option value="article">Article</option>
            <option value="resource">Resource</option>
          </select>
        </div>
      </div>
      
      {/* Category Selection */}
      <div className="mb-4 relative">
        <label className="block text-gray-300 mb-2">
          Category*
        </label>
        <div 
          className="flex items-center p-3 bg-gray-800 border border-gray-700 rounded-md cursor-pointer hover:bg-gray-750"
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          {categoryId ? (
            <>
              <div className="w-6 h-6 flex items-center justify-center bg-purple-900/60 rounded-full mr-2">
                {getCategoryIcon(categories.find(cat => cat.id === categoryId)?.name)}
              </div>
              <span className="flex-grow text-white">
                {categories.find(cat => cat.id === categoryId)?.name || 'Select a category'}
              </span>
            </>
          ) : (
            <span className="flex-grow text-gray-400">Select a category</span>
          )}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Category Dropdown */}
        {showCategoryDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {categories.map(category => (
              <div
                key={category.id}
                className={`flex items-center p-3 hover:bg-gray-700 cursor-pointer ${
                  categoryId === category.id ? 'bg-purple-900/40' : ''
                }`}
                onClick={() => {
                  setCategoryId(category.id);
                  setShowCategoryDropdown(false);
                }}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-purple-900/60 rounded-full mr-2">
                  {getCategoryIcon(category.name)}
                </div>
                <div>
                  <span className="text-white">{category.name}</span>
                  {category.description && (
                    <p className="text-xs text-gray-400">{category.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Content Field */}
      <div className="mb-4">
        <label htmlFor="content" className="block text-gray-300 mb-2">
          Content*
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 min-h-[150px] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          placeholder="Write your post content here..."
          required
        />
      </div>
      
      {/* Media Upload */}
      <div className="mb-6">
        <label htmlFor="media" className="block text-gray-300 mb-2">
          Media (Optional)
        </label>
        <input
          id="media"
          type="file"
          onChange={(e) => setMedia(e.target.files[0])}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          accept="image/*"
        />
        <p className="text-gray-400 text-sm mt-1">
          Add an image to your post. Max size: 5MB.
        </p>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          Cancel
        </button>
        
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
          ) : post ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </motion.form>
  );
};

export default PostForm; 