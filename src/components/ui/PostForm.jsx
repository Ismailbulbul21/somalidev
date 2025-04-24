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
  const [step, setStep] = useState(post ? 2 : 1); // Start at step 1 for new posts, step 2 for edits
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [postType, setPostType] = useState(post?.post_type || 'discussion');
  const [categoryId, setCategoryId] = useState(post?.category_id || preSelectedCategory || '');
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Auto-transition to step 2 when preSelectedCategory is provided
  useEffect(() => {
    // Only proceed to step 2 if we have a valid categoryId from preSelectedCategory
    // and we're not already in step 2 (to prevent unnecessary re-renders)
    if (preSelectedCategory && categoryId && step === 1 && !isLoading) {
      setStep(2);
    }
  }, [preSelectedCategory, categoryId, step, isLoading]);

  // Handle category selection and proceed to next step
  const handleCategorySelect = (id) => {
    setCategoryId(id);
    setStep(2);
  };

  // Go back to category selection
  const handleBackToCategories = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create or edit posts');
      return;
    }
    
    if (!categoryId) {
      setError('Please select a category');
      setStep(1);
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
      
      // Upload media if selected
      if (media && result) {
        await addPostMedia(result.id, media);
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

  // Category Selection Step
  if (step === 1) {
    return (
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-gray-900 border border-gray-800 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">
          Choose a Category for Your Post
        </h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                categoryId === category.id 
                  ? 'bg-purple-900/40 border-purple-500 text-white' 
                  : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-purple-900/60 rounded-full mr-3">
                  {/* Icon based on category name - you can customize these */}
                  {category.name.toLowerCase().includes('web') && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  )}
                  {category.name.toLowerCase().includes('mobile') && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  {category.name.toLowerCase().includes('back') && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  )}
                  {category.name.toLowerCase().includes('data') && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {category.name.toLowerCase().includes('design') && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  )}
                  {/* Default icon for other categories */}
                  {!['web', 'mobile', 'back', 'data', 'design'].some(term => 
                    category.name.toLowerCase().includes(term)
                  ) && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          
          {categoryId && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md transition-colors flex items-center"
            >
              Continue
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    );
  }
  
  // Post Creation/Edit Form
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
      
      {/* Selected category display */}
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">
          Category*
        </label>
        <div 
          className="flex items-center p-3 bg-gray-800/60 border border-gray-700 rounded-md cursor-pointer hover:bg-gray-800"
          onClick={handleBackToCategories}
        >
          <div className="w-6 h-6 flex items-center justify-center bg-purple-900/60 rounded-full mr-2">
            {/* Use the appropriate icon based on category */}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <span className="flex-grow text-white">
            {categories.find(cat => cat.id === categoryId)?.name || 'Select a category'}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
      
      <div className="mb-4">
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
      
      <div className="mb-4">
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
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBackToCategories}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center"
        >
          <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <div className="flex space-x-3">
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
      </div>
    </motion.form>
  );
};

export default PostForm; 