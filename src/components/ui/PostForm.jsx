import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiLink, FiEdit3, FiX, FiArrowLeft, FiSend, FiMessageSquare, FiHelpCircle, FiUpload } from 'react-icons/fi';
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
  const [step, setStep] = useState(preSelectedCategory ? 2 : 1);
  
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
  
  // Set preselected category if provided or changed
  useEffect(() => {
    if (preSelectedCategory) {
      console.log('PreSelectedCategory detected:', preSelectedCategory);
      setCategoryId(preSelectedCategory);
      // Also ensure we're on step 2 if category is pre-selected
      setStep(2);
      console.log('Set step to 2 because preSelectedCategory is provided');
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
    <div className={`${simplified ? 'bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-4' : 'bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-6'}`}>
      {!simplified && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Post' : 'Create New Post'}
          </h2>
          {onCancel && (
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      )}

      {simplified && (
        <h3 className="text-lg font-semibold text-white mb-3">
          Start a conversation
        </h3>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && !simplified && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Select a Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setCategoryId(category.id);
                      setStep(2);
                    }}
                    className={`p-3 rounded-lg border ${
                      categoryId === category.id
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-700 bg-gray-800/70 text-gray-300 hover:border-purple-400 hover:bg-gray-700/70'
                    } flex items-center transition-colors`}
                  >
                    {getCategoryIcon(category.name)}
                    <div className="ml-3 text-left">
                      <span className="block font-medium">{category.name}</span>
                      {category.description && (
                        <span className="text-xs text-gray-400 mt-0.5">{category.description}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {(step === 2 || simplified) && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit}>
              {/* Post Type Selection */}
              <div className="mb-4">
                <label className={`block ${simplified ? 'text-sm' : 'text-base'} font-medium text-gray-300 mb-2`}>
                  Post Type
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setPostType('discussion')}
                    className={`flex-1 py-2 px-3 rounded-lg border ${
                      postType === 'discussion'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-750'
                    } transition-colors flex items-center justify-center`}
                  >
                    <FiMessageSquare className="mr-2" />
                    <span>Discussion</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('question')}
                    className={`flex-1 py-2 px-3 rounded-lg border ${
                      postType === 'question'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-750'
                    } transition-colors flex items-center justify-center`}
                  >
                    <FiHelpCircle className="mr-2" />
                    <span>Question</span>
                  </button>
                </div>
              </div>

              {/* Category Selection (if in simplified mode) */}
              {simplified && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Post Title */}
              <div className="mb-4">
                <label 
                  htmlFor="title" 
                  className={`block ${simplified ? 'text-sm' : 'text-base'} font-medium text-gray-300 mb-2`}
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={postType === 'question' ? "What's your question?" : "Give your post a title"}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <label 
                  htmlFor="content" 
                  className={`block ${simplified ? 'text-sm' : 'text-base'} font-medium text-gray-300 mb-2`}
                >
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={postType === 'question' 
                    ? "Describe your question in detail. Include any relevant code or context." 
                    : "Share your thoughts, insights, or experiences..."
                  }
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 min-h-[120px] focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Media Upload - only show in full mode */}
              {!simplified && (
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Media (optional)
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-800/50 transition-colors ${
                      isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-400">
                      Click or drag images to upload
                    </p>
                  </div>

                  {/* Preview uploaded images */}
                  {mediaFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags Input - only show in full mode */}
              {!simplified && (
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Tags (optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add tags and press Enter (e.g., javascript, react)"
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-2 text-gray-400 hover:text-white"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                {step === 2 && !simplified && onCancel && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mr-3 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    simplified ? 'w-full' : ''
                  } px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center disabled:opacity-70`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {initialData ? 'Updating...' : 'Posting...'}
                    </>
                  ) : (
                    <>
                      {initialData ? 'Update Post' : simplified ? 'Post' : 'Create Post'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostForm; 