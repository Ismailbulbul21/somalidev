import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiX, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import { useAuth } from '../../utils/AuthContext';
import { createPost, updatePost } from '../../utils/supabaseClient.jsx';
import { getCategories, convertCategoryId } from '../../utils/categoryUtils.js';
import MediaUpload from './MediaUpload';
import { supabase } from '../../utils/supabaseClient.jsx';

const PostForm = ({ 
  initialData = null, 
  preSelectedCategory = null, 
  onPostCreated = null,
  onCancel = null,
  simplified = false
}) => {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [categoryId, setCategoryId] = useState(initialData?.category_id || preSelectedCategory || '');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(initialData?.media_url || null);
  
  // UI state
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  
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
      console.log(`Setting preSelectedCategory: ${preSelectedCategory}`);
      setCategoryId(preSelectedCategory);
      
      // Verify this category exists
      const checkCategory = async () => {
        // Check if it's in our loaded categories first
        const existingCategory = categories.find(cat => cat.id === preSelectedCategory);
        if (existingCategory) {
          console.log(`Found preselected category in local list: ${existingCategory.name}`);
          return;
        }
        
        // If not found locally, check the database
        try {
          const { data } = await supabase
            .from('categories')
            .select('id, name')
            .eq('id', preSelectedCategory)
            .single();
            
          if (data) {
            console.log(`Found preselected category in database: ${data.name}`);
            // Refresh our categories list
            const allCategories = await getCategories();
            if (allCategories) {
              setCategories(allCategories);
            }
          } else {
            console.log('Preselected category not found, using fallback');
          }
        } catch (error) {
          console.error('Error checking preselected category:', error);
        }
      };
      
      if (categories.length > 0) {
        checkCategory();
      }
    }
  }, [preSelectedCategory, categories.length]);
  
  // Update character count when content changes
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);
  
  // Handle submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsLoading(true);
    setError(null);
    
      // Validate inputs
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
    
    if (!trimmedTitle) {
        setError('Please enter a title for your post');
      return;
    }
    
    if (!trimmedContent) {
        setError('Please enter some content for your post');
      return;
    }
    
    if (!categoryId) {
        setError('Please select a category for your post');
      return;
    }
    
      console.log('Submitting post with media file:', mediaFile ? mediaFile.name : 'none');
      
      // Verify category is a valid UUID, if not, convert it
      let finalCategoryId = categoryId;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)) {
        try {
          console.log('Category ID is not a UUID, attempting conversion:', categoryId);
          const convertedId = await convertCategoryId(categoryId);
          
          if (convertedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(convertedId)) {
            finalCategoryId = convertedId;
            console.log('Successfully converted category ID:', finalCategoryId);
          } else {
            console.log('Conversion failed, looking for first category');
            // If conversion fails, try to get the first category
            const { data: firstCategory } = await supabase
              .from('categories')
              .select('id, name')
              .limit(1)
              .single();
              
            if (firstCategory) {
              finalCategoryId = firstCategory.id;
              console.log(`Using first category as fallback: ${firstCategory.name} (${finalCategoryId})`);
            }
          }
        } catch (error) {
          console.error('Error converting category ID:', error);
          
          // Try direct lookup as fallback
          try {
            const { data: directCategory } = await supabase
              .from('categories')
              .select('id, name')
              .or(`name.ilike.%${categoryId.replace(/-/g, ' ')}%,id.eq.${categoryId}`)
              .limit(1);
              
            if (directCategory && directCategory.length > 0) {
              finalCategoryId = directCategory[0].id;
              console.log(`Found by direct lookup: ${directCategory[0].name} (${finalCategoryId})`);
            } else {
              // Last resort get any category
              const { data: anyCategory } = await supabase
                .from('categories')
                .select('id, name')
                .limit(1)
                .single();
                
              if (anyCategory) {
                finalCategoryId = anyCategory.id;
                console.log(`Using any available category: ${anyCategory.name} (${finalCategoryId})`);
              }
            }
          } catch (innerError) {
            console.error('Error in direct lookup:', innerError);
          }
        }
      }
      
      // Prepare form data
      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('content', trimmedContent);
      formData.append('post_type', 'discussion'); // Default to discussion type
      formData.append('category_id', finalCategoryId);
      
      if (tags && tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      
      if (mediaFile) {
        console.log('Adding media file to form data:', mediaFile.name, mediaFile.type, mediaFile.size);
        formData.append('media', mediaFile);
      }
      
      // Submit the post
      let result;
      if (initialData) {
        console.log('Updating existing post:', initialData.id);
        result = await updatePost(initialData.id, formData);
        toast.success('Post updated successfully!');
      } else {
        console.log('Creating new post with form data');
        result = await createPost(formData);
        
        // Ensure result has media_url if it was uploaded
        if (result && mediaFile && !result.media_url) {
          console.log('Post created but media_url is missing. Adding from result:', result);
          // Some implementations might return the URL in a different field
          if (result._media_url) {
            result.media_url = result._media_url;
          }
        }
        
        // Ensure category information is preserved
        if (result && finalCategoryId) {
          // Find the category in our local list
          const category = categories.find(c => c.id === finalCategoryId);
          if (category && (!result.categories || !result.categories.name)) {
            console.log('Adding category information to result:', category);
            result.categories = category;
            result._categories = {...category};
          }
        }
        
        toast.success('Post published successfully!');
      }
      
      console.log('Final post result:', result);
      
      // Reset form
        setTitle('');
        setContent('');
        setTags([]);
        setMediaFile(null);
        setMediaPreview(null);
      setError(null);
      
      // Call post created callback if provided
      if (onPostCreated) {
        onPostCreated(result, initialData ? 'updated' : 'created');
      }
    } catch (error) {
      console.error('Error creating/updating post:', error);
      setError(error.message || 'Failed to publish post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file selection for media
  const handleFileSelect = (file) => {
    setMediaFile(file);
    
    // Create and revoke preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
    
    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(previewUrl);
  };
  
  // Handle media removal
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  // Render the simplified form for sidebar
  return (
    <div className={`w-full space-y-5 ${mediaPreview ? 'pb-16 md:pb-0' : ''}`}>
      {/* Title Input */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-gray-800/60 text-white border border-gray-700/60 rounded-xl p-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
        />
      </div>
      
      {/* Content Area */}
      <div>
        <TextareaAutosize
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, ask a question, or post an update..."
          minRows={4}
          maxRows={12}
          className="w-full bg-gray-800/60 text-white border border-gray-700/60 rounded-xl p-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 resize-none"
        />
        <div className="flex justify-end mt-2 text-sm text-gray-400">
          <span>{charCount} characters</span>
              </div>
            </div>
            
            {/* Category Selection */}
      <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-gray-800/60 text-white border border-gray-700/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="">Select a category</option>
          {categories
            .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
              </div>
            </div>
            
            {/* Media Upload */}
      <div>
              <MediaUpload
                mediaFile={mediaFile}
                mediaPreview={mediaPreview}
          onFileSelect={handleFileSelect}
          onRemove={handleRemoveMedia}
              />
            </div>
            
            {/* Error Message */}
            {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                {error}
              </div>
            )}
            
      {/* Submit and Cancel Buttons */}
      <div className={`flex space-x-3 justify-end ${mediaPreview ? 'fixed bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-700 backdrop-blur-sm z-50 md:static md:bg-transparent md:border-0 md:p-0 md:mt-5' : 'pt-3'}`}>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 text-gray-300 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors text-base"
          >
            Cancel
          </button>
        )}
              <button
          type="button"
          onClick={handleSubmit}
                disabled={isLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2 text-base font-medium"
              >
                {isLoading ? (
                  <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
              <span>Posting...</span>
                  </>
                ) : (
                  <>
              <FiSend className="h-5 w-5" />
              <span>Post</span>
                  </>
                )}
              </button>
            </div>
        </div>
  );
};

export default PostForm; 