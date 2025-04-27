import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { getCategories, convertCategoryId } from '../utils/categoryUtils.js';
import { getPosts } from '../utils/posts.js';
import { supabase } from '../utils/supabaseClient.jsx';
import PostCard from '../components/ui/PostCard';
import PostForm from '../components/ui/PostForm';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Add CSS to hide text content before categories
const hideTextBeforeCategories = {
  display: 'none'
};

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [error, setError] = useState(null);
  const [activeCategoryName, setActiveCategoryName] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showPostFormModal, setShowPostFormModal] = useState(false);
  
  const pageSize = 10;
  
  // Post types
  const postTypes = [
    { value: '', label: 'All Types' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'question', label: 'Question' },
    { value: 'project', label: 'Project Showcase' },
    { value: 'article', label: 'Article' },
    { value: 'resource', label: 'Resource' }
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'created_at', label: 'Date' },
    { value: 'like_count', label: 'Likes' },
    { value: 'comment_count', label: 'Comments' },
    { value: 'view_count', label: 'Views' }
  ];
  
  // Load cached posts from session storage
  useEffect(() => {
    const cachedPosts = sessionStorage.getItem('community_posts');
    const cachedCategories = sessionStorage.getItem('community_categories');
    
    if (cachedPosts) {
      try {
        const parsedData = JSON.parse(cachedPosts);
        // Ensure deep object references are preserved for media_url and categories
        const processedPosts = parsedData.map(post => {
          // Handle case when media_url is undefined but should be preserved
          if (!post.media_url && post._media_url) {
            post.media_url = post._media_url;
          }
          
          // Ensure categories are properly set
          if (!post.categories && post._categories) {
            post.categories = post._categories;
          }
          
          return post;
        });
        setPosts(processedPosts);
        setLoading(false);
      } catch (e) {
        console.error("Error parsing cached posts:", e);
      }
    }
    
    if (cachedCategories) {
      try {
        const parsedData = JSON.parse(cachedCategories);
        setCategories(parsedData);
      } catch (e) {
        console.error("Error parsing cached categories:", e);
      }
    }
  }, []);
  
  // Update URL when filters change
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    const params = new URLSearchParams();
    
    if (selectedType) params.set('type', selectedType);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'created_at') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    if (page > 1) params.set('page', page.toString());
    
    if (selectedCategory) {
      navigate(`/community/category/${selectedCategory}${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    } else {
      navigate(`/community${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    }
    
  }, [selectedCategory, selectedType, searchQuery, sortBy, sortOrder, page, navigate, initialLoadComplete]);
  
  // Fetch posts
  const fetchPosts = async (skipLoadingState = false) => {
    if (!skipLoadingState) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      console.log('Fetching posts with filters:', {
        categoryId: selectedCategory,
        postType: selectedType,
        searchTerm: searchQuery,
        sortBy,
        sortOrder,
        page
      });
      
      // Create filter object
      const filter = {};
      if (selectedCategory) filter.categoryId = selectedCategory;
      if (selectedType) filter.postType = selectedType;
      if (searchQuery) filter.searchTerm = searchQuery;
      
      const { data, count, error } = await getPosts({
        page,
        pageSize,
        filter,
        sortBy,
        sortOrder
      });
      
      if (error) {
      console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
        return;
      }
      
      console.log(`Fetched ${data?.length} posts out of ${count} total`);
      
      if (data && data.length > 0) {
        // Process posts to create backup copies of critical fields
        const processedPosts = data.map(post => {
          // Create a deep copy to avoid reference issues
          const processedPost = { ...post };
          
          // Create backup copy of media_url and categories
          if (processedPost.media_url) {
            processedPost._media_url = processedPost.media_url;
          }
          
          if (processedPost.categories) {
            processedPost._categories = JSON.parse(JSON.stringify(processedPost.categories)); // Deep clone
          }
          
          // Ensure the post object has all required fields
          return {
            ...processedPost,
            media_url: processedPost.media_url || processedPost._media_url || null,
            _media_url: processedPost._media_url || processedPost.media_url || null,
            categories: processedPost.categories || processedPost._categories || null,
            _categories: processedPost._categories || processedPost.categories || null
          };
        });
        
        setPosts(processedPosts);
        // Cache posts in session storage with more reliable structure
        try {
          sessionStorage.setItem('community_posts', JSON.stringify(processedPosts));
        } catch (storageError) {
          console.error('Error caching posts to session storage:', storageError);
        }
        setTotalPages(Math.ceil((count || 0) / pageSize));
      } else if (posts.length === 0) {
        // Only set empty posts if we don't already have posts
        setPosts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Exception in fetchPosts:', error);
      setError('Failed to fetch posts. Please try again later.');
      
      // Don't clear existing posts on error to prevent UI flicker
      if (posts.length === 0) {
        setPosts([]);
        setTotalPages(0);
      }
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      if (result && result.length > 0) {
      setCategories(result);
        // Cache categories in session storage
        sessionStorage.setItem('community_categories', JSON.stringify(result));
      }
      
      // Find active category details if we have a categoryId
      if (selectedCategory && result) {
        const category = result.find(cat => cat.id === selectedCategory);
        if (category) {
          console.log(`Found active category: ${category.name}`);
        setActiveCategory(category);
          setActiveCategoryName(category.name);
        } else {
          console.log(`Category ID not found in results: ${selectedCategory}`);
          // Try to fetch it directly
          supabase
            .from('categories')
            .select('*')
            .eq('id', selectedCategory)
            .single()
            .then(({ data: categoryData }) => {
              if (categoryData) {
                console.log(`Found category from direct query: ${categoryData.name}`);
                setActiveCategory(categoryData);
                setActiveCategoryName(categoryData.name);
              }
            })
            .catch(error => {
              console.error('Error fetching direct category:', error);
            });
        }
      } else {
        setActiveCategory(null);
        setActiveCategoryName('');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep existing categories on error
    }
  };
  
  // Fetch data when filters change
  useEffect(() => {
    console.log('Filter change detected, fetching posts with current filters');
    // If changing sort order, preserve existing post data temporarily
    if (posts.length > 0) {
      // Store the current post data in a local variable
      const currentPosts = posts.map(post => ({
        ...post,
        // Ensure these properties are preserved
        _media_url: post.media_url || post._media_url,
        _categories: post.categories || post._categories
      }));
      
      // After fetching, check if media_url or categories are missing and restore them
      const fetchAndPreserve = async () => {
        await fetchPosts();
        // Check if we need to restore missing properties in the new posts
        setPosts(prevPosts => prevPosts.map(newPost => {
          // Try to find the matching post from our preserved data
          const matchingPost = currentPosts.find(p => p.id === newPost.id);
          if (matchingPost) {
            return {
              ...newPost,
              // Restore media_url if it's missing in the new data but existed before
              media_url: newPost.media_url || matchingPost._media_url || matchingPost.media_url || null,
              _media_url: matchingPost._media_url || matchingPost.media_url || newPost.media_url || null,
              // Restore categories if missing in the new data but existed before
              categories: newPost.categories || matchingPost._categories || matchingPost.categories || null,
              _categories: matchingPost._categories || matchingPost.categories || newPost.categories || null
            };
          }
          return newPost;
        }));
      };
      
      fetchAndPreserve();
    } else {
    fetchPosts();
    }
    
    // Reset to page 1 when filters change (except when page itself changes)
    if (page !== 1 && 
      !window.location.href.includes(`page=${page}`)) {
      setPage(1);
    }
  }, [selectedCategory, selectedType, searchQuery, sortBy, sortOrder]);
  
  // Fetch data when page changes
  useEffect(() => {
    fetchPosts();
    window.scrollTo(0, 0);
  }, [page]);
  
  // Initial data fetch and sync with URL params
  useEffect(() => {
    console.log('Initial data fetch with categoryId:', categoryId);
    
    // First fetch categories
    fetchCategories();
    
    // Then handle URL parameters
    if (categoryId) {
      console.log(`URL has category ID: ${categoryId}`);
      setSelectedCategory(categoryId);
    
      // Attempt to fetch posts for this category
    fetchPosts();
    } else {
      console.log('No category ID in URL, showing all posts');
      // Clear selected category - explicitly, just like the All Posts button does
      setSelectedCategory('');
      setActiveCategory(null);
      setActiveCategoryName('');
      setIsFilterApplied(false);
      
      // Use handleCategorySelect to ensure the same code path as clicking "All Posts"
      handleCategorySelect('');
    }
    
    // Set initialLoadComplete flag
    setInitialLoadComplete(true);
  }, [categoryId]);
  
  // Handle component mount - ensure we have posts
  useEffect(() => {
    if (posts.length === 0 && !loading && !isLoading) {
      console.log('No posts found after initial load, fetching all posts');
      fetchAllPosts();
    }
  }, [initialLoadComplete]);
  
  // Function to fetch all posts without filters
  const fetchAllPosts = async () => {
    console.log('fetchAllPosts called');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching all posts without filters');
      
      // First check if we have cached posts
      const cachedPosts = sessionStorage.getItem('community_all_posts');
      
      if (cachedPosts && !isFilterApplied) {
        try {
          const parsedData = JSON.parse(cachedPosts);
          const cachedTimestamp = sessionStorage.getItem('community_all_posts_timestamp');
          const now = new Date().getTime();
          // Only use cache if it's less than 60 seconds old
          if (cachedTimestamp && (now - parseInt(cachedTimestamp)) < 60000) {
            console.log('Using cached posts data');
            
            // Process posts to ensure media and categories are preserved
            const processedPosts = parsedData.posts.map(post => {
              // Create a deep copy to avoid reference issues
              const processedPost = { ...post };
              
              // Handle case when media_url is undefined but should be preserved
              if (!processedPost.media_url && processedPost._media_url) {
                processedPost.media_url = processedPost._media_url;
              }
              
              // Ensure categories are properly set
              if (!processedPost.categories && processedPost._categories) {
                processedPost.categories = processedPost._categories;
              }
              
              // Ensure the post object has all required fields
              return {
                ...processedPost,
                media_url: processedPost.media_url || processedPost._media_url || null,
                _media_url: processedPost._media_url || processedPost.media_url || null,
                categories: processedPost.categories || processedPost._categories || null,
                _categories: processedPost._categories || processedPost.categories || null
              };
            });
            
            console.log('Processed posts from cache:', processedPosts.length);
            setPosts(processedPosts || []);
            setTotalPages(parsedData.totalPages || 1);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached all posts:", e);
        }
      }
      
      // Direct table query approach (simpler and more reliable)
      console.log('Using direct table query for all posts');
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:profile_id (id, full_name, avatar_url, title),
          categories:category_id (id, name, description)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });
      
      // Apply pagination
      const { data: allPosts, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      
      if (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again.');
        if (posts.length === 0) {
          setPosts([]);
          setTotalPages(0);
        }
      } else {
        console.log(`Fetched ${allPosts?.length || 0} posts with direct query`);
        
        if (allPosts && allPosts.length > 0) {
          console.log('Posts data sample:', allPosts[0]);
          
          // Process posts to create backup copies of critical fields
          const processedPosts = allPosts.map(post => {
            // Create a deep copy to avoid reference issues
            const processedPost = { ...post };
            
            // Create backup copy of media_url and categories
            if (processedPost.media_url) {
              processedPost._media_url = processedPost.media_url;
            }
            
            if (processedPost.categories) {
              processedPost._categories = JSON.parse(JSON.stringify(processedPost.categories)); // Deep clone
            }
            
            // Log the post's media and category details for debugging
            console.log(`Post ${post.id} has media_url: ${post.media_url}, categories: ${JSON.stringify(post.categories)}`);
            
            // Ensure the post object has all required fields
            return {
              ...processedPost,
              media_url: processedPost.media_url || processedPost._media_url || null,
              _media_url: processedPost._media_url || processedPost.media_url || null,
              categories: processedPost.categories || processedPost._categories || null,
              _categories: processedPost._categories || processedPost.categories || null
            };
          });
          
          console.log('Processed posts:', processedPosts.length);
          setPosts(processedPosts);
          const calculatedTotalPages = Math.ceil((count || 0) / pageSize);
          setTotalPages(calculatedTotalPages);
          
          // Cache the results with processed posts
          try {
            sessionStorage.setItem('community_all_posts', JSON.stringify({
              posts: processedPosts,
              totalPages: calculatedTotalPages
            }));
            sessionStorage.setItem('community_all_posts_timestamp', new Date().getTime().toString());
          } catch (storageError) {
            console.error('Error caching all posts to session storage:', storageError);
          }
        } else if (posts.length === 0) {
          // Only set empty posts if we don't already have posts
          setPosts([]);
          setTotalPages(0);
        }
      }
    } catch (error) {
      console.error('Exception in fetchAllPosts:', error);
      
      // Ultimate fallback - simplest query possible
      try {
        console.log('Using ultimate fallback query');
        const { data } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:profile_id (id, full_name, avatar_url, title),
            categories:category_id (id, name, description)
          `)
          .order('created_at', { ascending: false })
          .limit(pageSize);
        
        if (data && data.length > 0) {
          console.log(`Found ${data.length} posts with ultimate fallback`);
          
          // Process the data the same way
          const processedPosts = data.map(post => {
            const processedPost = { ...post };
            
            if (processedPost.media_url) {
              processedPost._media_url = processedPost.media_url;
            }
            
            if (processedPost.categories) {
              processedPost._categories = JSON.parse(JSON.stringify(processedPost.categories));
            }
            
            return {
              ...processedPost,
              media_url: processedPost.media_url || processedPost._media_url || null,
              _media_url: processedPost._media_url || processedPost.media_url || null,
              categories: processedPost.categories || processedPost._categories || null,
              _categories: processedPost._categories || processedPost.categories || null
            };
          });
          
          setPosts(processedPosts);
          setTotalPages(1);
        } else if (posts.length === 0) {
          setError('No posts found. Try creating the first post!');
          setPosts([]);
          setTotalPages(0);
        }
      } catch (fallbackError) {
        console.error('Even ultimate fallback failed:', fallbackError);
        setError('Failed to load posts. Please try again.');
        if (posts.length === 0) {
          setPosts([]);
          setTotalPages(0);
        }
      }
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };
  
  // Function to clear the cache and force reload of posts
  const refreshData = () => {
    console.log('Forcing data refresh');
    // Clear post caches
    sessionStorage.removeItem('community_posts');
    sessionStorage.removeItem('community_all_posts');
    
    // Clear category-specific caches
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('community_category_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Reload data
    setIsLoading(true);
    setPosts([]);
    
    if (selectedCategory) {
      fetchPosts();
    } else {
      fetchAllPosts();
    }
  };
  
  // Update handlePostSuccess to refresh cached data
  const handlePostSuccess = (newPost) => {
    console.log("Post creation successful, handling new post:", newPost);
    
    // Clear cached data to ensure fresh content
    sessionStorage.removeItem('community_posts');
    sessionStorage.removeItem('community_all_posts');
    
    // Immediately add the new post to the top of the list
    if (newPost) {
      console.log("New post details:", {
        id: newPost.id,
        hasMediaUrl: !!newPost.media_url,
        hasCategories: !!newPost.categories || !!newPost.category_id
      });
      
      // Properly extract the category data
      let categoryData = null;
      if (newPost.categories) {
        // If categories object is present, use it directly
        categoryData = typeof newPost.categories === 'object' ? 
          { ...newPost.categories } : // Clone to avoid reference issues
          { id: null, name: newPost.categories, description: '' };
      } else if (newPost.category_id) {
        // If only category_id is present, try to find the category name
        const foundCategory = categories.find(c => c.id === newPost.category_id);
        categoryData = foundCategory ? 
          { ...foundCategory } : 
          { id: newPost.category_id, name: 'Category', description: '' };
      }
      
      // Process the new post to match the format expected by PostCard
      const processedNewPost = {
        ...newPost,
        // Ensure media_url is properly set with backup
        media_url: newPost.media_url || null,
        _media_url: newPost.media_url || null,
        
        // Properly structure the categories object using our extracted data
        categories: categoryData,
        _categories: categoryData, // Save backup
        
        // Set default values for rendering
        like_count: 0,
        comment_count: 0,
        view_count: 0,
        user_has_liked: false,
        user_has_saved: false
      };
      
      console.log("Processed post for display:", {
        id: processedNewPost.id,
        media_url: processedNewPost.media_url,
        _media_url: processedNewPost._media_url,
        categories: processedNewPost.categories,
        _categories: processedNewPost._categories
      });
      
      // Add the new post to the beginning of the posts array
      setPosts(prevPosts => [processedNewPost, ...prevPosts]);
    }
    
    // Also refresh posts to get the latest data - but with a delay
    setTimeout(() => {
      console.log("Refreshing posts after post creation");
      fetchAllPosts(); // Use fetchAllPosts to guarantee proper data loading
    }, 1500); // Longer delay to ensure server has processed the new post
    
    setShowPostForm(false); // Hide the form after successful post
  };
  
  // Handler for category selection
  const handleCategorySelect = async (categoryId) => {
    console.log(`Category selection triggered with ID: ${categoryId}`);
    
    // Set the loading state immediately to reduce perceived lag
    setIsLoading(true);
    
    // Check if clicking the already selected category - toggle it off
    if (categoryId === selectedCategory && selectedCategory !== '') {
      console.log('Deselecting current category, showing all posts');
      setActiveCategory(null);
      setSelectedCategory('');
      setActiveCategoryName('');
      setIsFilterApplied(false);
      await fetchAllPosts();
      setIsLoading(false);
      return;
    }
    
    // When "All Posts" is selected (empty categoryId)
    if (!categoryId) {
      console.log('All Posts selected, fetching all posts');
      setActiveCategory(null);
      setSelectedCategory('');
      setActiveCategoryName('');
      setIsFilterApplied(false);
      // Directly fetch all posts without filters
      await fetchAllPosts();
      setIsLoading(false);
      return;
    }
    
    // For category selection, set the selected category and find its details
    try {
      console.log(`Setting selected category to: ${categoryId}`);
      
      // Try to convert the category ID if needed
      let finalCategoryId = categoryId;
      try {
        const convertedId = await convertCategoryId(categoryId);
        if (convertedId) {
          console.log(`Converted category ID from ${categoryId} to ${convertedId}`);
          finalCategoryId = convertedId;
    } else {
          console.log(`Could not convert ID, using original: ${categoryId}`);
        }
      } catch (conversionError) {
        console.error('Error converting category ID:', conversionError);
        console.log(`Using original ID due to conversion error: ${categoryId}`);
      }
      
      // Set the state for URL and filtering
      setSelectedCategory(finalCategoryId);
      setIsFilterApplied(true);
      
      // Check cache first for faster response
      const cachedCategoryPosts = sessionStorage.getItem(`community_category_${finalCategoryId}`);
      if (cachedCategoryPosts) {
        try {
          const parsedData = JSON.parse(cachedCategoryPosts);
          const cachedTimestamp = sessionStorage.getItem(`community_category_${finalCategoryId}_timestamp`);
          const now = new Date().getTime();
          
          // Only use cache if it's less than 30 seconds old
          if (cachedTimestamp && (now - parseInt(cachedTimestamp)) < 30000) {
            console.log('Using cached category posts data');
            
            // Process posts to ensure media and categories are preserved
            const processedPosts = parsedData.posts.map(post => {
              // Handle case when media_url is undefined but should be preserved
              if (!post.media_url && post._media_url) {
                post.media_url = post._media_url;
              }
              
              // Ensure categories are properly set
              if (!post.categories && post._categories) {
                post.categories = post._categories;
              }
              
              // Ensure the post object has all required fields
              return {
                ...post,
                media_url: post.media_url || post._media_url || null,
                _media_url: post._media_url || post.media_url || null,
                categories: post.categories || post._categories || null,
                _categories: post._categories || post.categories || null
              };
            });
            
            setPosts(processedPosts || []);
            setTotalPages(parsedData.totalPages || 1);
            
            // We still need to find and set the active category
            if (parsedData.category) {
              setActiveCategory(parsedData.category);
              setActiveCategoryName(parsedData.category.name || 'Selected Category');
            }
            
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached category posts:", e);
        }
      }
      
      // Find and set the active category details
      // Try both with original and converted ID
      let category = categories.find(cat => cat.id === finalCategoryId || cat.id === categoryId);
      
      if (category) {
        console.log(`Found category in local list: ${category.name}`);
        setActiveCategory(category);
        setActiveCategoryName(category.name);
      } else {
        // If category not found locally, try to fetch it
        console.log('Category not found locally, fetching from database');
        // Set a loading state
        setActiveCategory({ id: finalCategoryId, name: 'Loading...' });
        setActiveCategoryName('Loading...');
        
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', finalCategoryId)
          .single();
          
        if (categoryData) {
          console.log(`Found category in database: ${categoryData.name}`);
          setActiveCategory(categoryData);
          setActiveCategoryName(categoryData.name);
          category = categoryData;
        } else {
          console.log('Category not found in database, using fallback');
          setActiveCategory({ id: finalCategoryId, name: 'Selected Category' });
          setActiveCategoryName('Selected Category');
          category = { id: finalCategoryId, name: 'Selected Category' };
          
          // Refresh categories to make sure we have the latest data
        fetchCategories();
      }
    }
      
      // Directly fetch posts from the database with category filter applied
      console.log(`Fetching posts with category filter: ${finalCategoryId}`);
      const { data: filteredPosts, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:profile_id (id, full_name, avatar_url, title),
          categories:category_id (id, name, description)
        `, { count: 'exact' })
        .eq('category_id', finalCategoryId)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (error) {
        console.error('Error fetching category posts:', error);
        throw error;
      }
      
      if (filteredPosts && filteredPosts.length > 0) {
        console.log(`Found ${filteredPosts.length} posts for category ${finalCategoryId}`);
        
        // Process posts to create backup copies of critical fields
        const processedPosts = filteredPosts.map(post => {
          // Create deep copy to avoid reference issues
          const processedPost = { ...post };
          
          // Create backup copy of media_url and categories
          if (processedPost.media_url) {
            processedPost._media_url = processedPost.media_url;
          }
          
          if (processedPost.categories) {
            processedPost._categories = JSON.parse(JSON.stringify(processedPost.categories)); // Deep clone
          }
          
          // Ensure the post object has all required fields
          return {
            ...processedPost,
            media_url: processedPost.media_url || processedPost._media_url || null,
            _media_url: processedPost._media_url || processedPost.media_url || null,
            categories: processedPost.categories || processedPost._categories || null,
            _categories: processedPost._categories || processedPost.categories || null
          };
        });
        
        // Cache filtered posts
        try {
          sessionStorage.setItem(`community_category_${finalCategoryId}`, JSON.stringify({
            posts: processedPosts,
            totalPages: Math.ceil((count || 0) / pageSize),
            category
          }));
          sessionStorage.setItem(`community_category_${finalCategoryId}_timestamp`, new Date().getTime().toString());
        } catch (storageError) {
          console.error(`Error caching category ${finalCategoryId} posts:`, storageError);
        }
        
        // Update state with the processed posts
        setPosts(processedPosts);
        setTotalPages(Math.ceil((count || 0) / pageSize));
      } else {
        // If no posts found, set empty array
        setPosts([]);
        setTotalPages(0);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error in handleCategorySelect:', error);
      setSelectedCategory(categoryId); // Still set the ID even if we couldn't get details
      fetchPosts(true); // Skip setting loading again
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Get icon for a category
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return null;
    const name = categoryName.toLowerCase();
    
    if (name.includes('web')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    } else if (name.includes('mobile')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (name.includes('back')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      );
    } else if (name.includes('data')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    } else if (name.includes('design')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    }
  };
  
  // Post list rendering
  const renderPosts = () => {
    console.log('Rendering posts, total count:', posts.length);
    
    // Debug details of first post if available
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log('First post details:', {
        id: firstPost.id,
        hasMediaUrl: !!firstPost.media_url,
        backupMediaUrl: firstPost._media_url,
        hasCategories: !!firstPost.categories,
        backupCategories: firstPost._categories
      });
    }
    
    // Process posts for display to ensure consistent data
    const processedPostsForDisplay = Array.isArray(posts) ? posts.map(post => {
      // Make a deep copy to avoid reference issues
      const processedPost = { ...post };
      
      // Ensure media_url is properly preserved
      processedPost.media_url = post.media_url || post._media_url || null;
      processedPost._media_url = post._media_url || post.media_url || null;
      
      // Ensure categories are properly preserved
      if (post.categories) {
        processedPost.categories = typeof post.categories === 'object' ? 
          { ...post.categories } : // Clone object
          post.categories; // Keep as is
        processedPost._categories = typeof post.categories === 'object' ? 
          JSON.parse(JSON.stringify(post.categories)) : // Deep clone
          post.categories; // Keep as is
      } else if (post._categories) {
        processedPost.categories = typeof post._categories === 'object' ? 
          { ...post._categories } : // Clone object
          post._categories; // Keep as is
        processedPost._categories = post._categories;
      } else if (post.category_id) {
        // Try to find category from our categories list
        const foundCategory = categories.find(c => c.id === post.category_id);
        if (foundCategory) {
          processedPost.categories = { ...foundCategory };
          processedPost._categories = { ...foundCategory };
        }
      }
      
      return processedPost;
    }) : [];
    
    // Show skeleton loaders when posts are loading the first time
    if (loading && processedPostsForDisplay.length === 0) {
  return (
        <div className="space-y-5">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-800/70 rounded-xl p-4 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="h-40 bg-gray-700 rounded-lg mb-4"></div>
              <div className="flex items-center space-x-6">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Show a smaller loader when refreshing data with existing posts
    if (isLoading && processedPostsForDisplay.length > 0) {
      return (
        <div>
          <div className="flex justify-center my-4">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 opacity-70"
          >
            {processedPostsForDisplay.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={(deletedId) => {
                  setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedId));
                  // Refresh cache after deletion
                  if (selectedCategory) {
                    sessionStorage.removeItem(`community_category_${selectedCategory}`);
                  } else {
                    sessionStorage.removeItem('community_all_posts');
                  }
                }}
              />
            ))}
          </motion.div>
        </div>
      );
    }
    
    // Show error state
    if (error && processedPostsForDisplay.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-200 mb-3">Couldn't load posts</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={refreshData}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    // No posts found state
    if (!processedPostsForDisplay || processedPostsForDisplay.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="text-6xl mb-4">📪</div>
          <h3 className="text-2xl font-bold text-gray-200 mb-3">No posts found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery || selectedCategory || selectedType
              ? 'Try changing your search or filters'
              : 'Be the first to start a conversation'}
          </p>
          {user && (
            <button
              onClick={() => setShowPostForm(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
            >
              Publish a Post
            </button>
          )}
        </div>
      );
    }
    
    // Post list
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {processedPostsForDisplay.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onDelete={(deletedId) => {
              setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedId));
              // Refresh cache after deletion
              if (selectedCategory) {
                sessionStorage.removeItem(`community_category_${selectedCategory}`);
              } else {
                sessionStorage.removeItem('community_all_posts');
              }
            }}
          />
        ))}
      </motion.div>
    );
  };
  
  // Function to handle post updates (creation, editing, deletion)
  const handlePostUpdated = useCallback(async (action, postData = null) => {
    console.log(`Post ${action}:`, postData);
    
    // Refresh the posts based on current filters
    if (!selectedCategory) {
      await fetchAllPosts();
    } else {
      await fetchPosts();
    }
    
    // If a new post was created, scroll to top to show it
    if (action === 'created' && postData) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Update session storage with the latest posts
      try {
        sessionStorage.setItem('cachedPosts', JSON.stringify(posts));
      } catch (storageError) {
        console.error('Error caching posts after update:', storageError);
      }
    }
    
    // Close the post form modal if it's open
    setShowPostFormModal(false);
  }, [selectedCategory, posts]);
  
  // Add cleanup function to reset state when component unmounts
  useEffect(() => {
    return () => {
      console.log('Community component unmounting, clearing state');
      // Cleanup function to ensure fresh state on remount
      setSelectedCategory('');
      setActiveCategory(null);
      setActiveCategoryName('');
      setIsFilterApplied(false);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Completely rewritten */}
        <div className="mb-6">
          {/* Just the title */}
          <h1 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">
              {activeCategory ? activeCategory.name : 'Community'}
            </span>
          </h1>
          
          {/* Mobile Create Post Button - Shown only on mobile */}
          <div className="lg:hidden mb-4 flex gap-2">
            {user ? (
              <button 
                onClick={() => setShowPostForm(true)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Post</span>
              </button>
            ) : (
              <Link 
                to="/signin"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </Link>
            )}
            
            {/* Mobile Sort Order Button */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-3 rounded-xl bg-gray-800/70 text-white border border-gray-700/40"
              aria-label="Toggle sort order"
            >
              {sortOrder === 'desc' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Only Category Buttons */}
          <div className="flex justify-center flex-wrap gap-2 mx-auto max-w-3xl">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all 
                ${!selectedCategory 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white'}`}
            >
              All Posts
            </button>
            
            {/* Hide individual category buttons */}
            {false && categories && categories.length > 0 && categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5
                  ${selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white'}`}
              >
                  {getCategoryIcon(category.name)}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-1/4 order-2 lg:order-1">
            {/* All Posts Button */}
            <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/40 mb-6 p-4">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center space-x-3
                  ${!selectedCategory 
                    ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white' 
                    : 'hover:bg-gray-700/40 text-gray-300 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Posts</span>
              </button>
            </div>
              
            {/* Filters Card */}
            <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/40 mb-6 overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Sort Order Only */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-400">Sort Order</label>
                  <button
                    onClick={() => {
                      console.log('Changing sort order from', sortOrder, 'to', sortOrder === 'desc' ? 'asc' : 'desc');
                      console.log('Current posts before sort change:', posts.map(post => ({
                        id: post.id,
                        title: post.title,
                        hasMedia: !!post.media_url,
                        mediaUrl: post.media_url,
                        backupMediaUrl: post._media_url,
                        hasCategories: !!post.categories,
                        categoryName: post.categories?.name
                      })));
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    }}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-700/60 text-white"
                  >
                    <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                    {sortOrder === 'desc' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
                      
            {/* Remove the create post card from here since we moved it to the top */}
          </div>

          {/* Main Content - Posts & Search */}
          <div className="lg:w-2/5 order-1 lg:order-2">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={selectedCategory ? `Search in ${activeCategory?.name || 'this category'}...` : "Search posts..."}
                  className="w-full bg-gray-800/40 backdrop-blur-lg border border-gray-700/50 text-white rounded-xl px-5 py-3.5 pl-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-lg"
                />
                <svg 
                  className="absolute left-4 top-4 w-5 h-5 text-indigo-400" 
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Filter Pills - Only visible on mobile */}
            <div className="lg:hidden mb-4 overflow-x-auto flex flex-nowrap gap-2 pb-2 scrollbar-hide">
              {/* All Posts Pill */}
              <button
                onClick={() => handleCategorySelect('')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${!selectedCategory 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white'}`}
              >
                All Posts
              </button>
              
              {/* Sort Order Pill */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white flex items-center gap-1"
              >
                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                {sortOrder === 'desc' ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Error Message Display */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-900/40 to-purple-900/20 backdrop-blur-sm border border-red-800/50 rounded-xl text-sm text-red-200 shadow-md">
                <p>{error}</p>
              </div>
            )}
            
            {/* Posts List */}
            {renderPosts()}
            
            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-3">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={`p-2 rounded-lg flex items-center justify-center ${
                      page === 1
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600/80 text-white hover:bg-indigo-700 transition-colors'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <span className="text-white bg-gray-800/60 px-4 py-2 rounded-lg">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`p-2 rounded-lg flex items-center justify-center ${
                      page === totalPages
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600/80 text-white hover:bg-indigo-700 transition-colors'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
          
          {/* Right Sidebar - Create Post & User */}
          <div className="lg:w-1/3 order-3 hidden lg:block">
            {/* Create Post Form */}
            {user ? (
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-700/30 p-6 sticky top-8">
                <h3 className="text-2xl font-semibold text-white mb-5">Share with the community</h3>
                <PostForm 
                  preSelectedCategory={selectedCategory} 
                  onPostCreated={handlePostSuccess} 
                  simplified={false}
                />
        </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-700/30 p-6 text-center sticky top-8">
                <h3 className="text-2xl font-semibold text-white mb-4">Join the conversation</h3>
                <p className="text-gray-300 mb-5 text-lg">Sign in to create posts and interact with the community</p>
                <Link 
                  to="/signin"
                  className="inline-block w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg text-lg"
                >
                  Sign In
                </Link>
      </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Full-screen Post Form Modal */}
      {showPostForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-800"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-2xl font-semibold text-white">Create New Post</h3>
              <button 
                onClick={() => setShowPostForm(false)}
                className="p-2 rounded-full hover:bg-gray-800"
              >
                <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PostForm
                preSelectedCategory={selectedCategory}
                onPostCreated={handlePostSuccess}
                simplified={false}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Post Form Modal for mobile */}
      {showPostFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create a Post</h2>
                <button 
                  onClick={() => setShowPostFormModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <PostForm onPostCreated={(post) => handlePostSuccess(post)} />
            </div>
          </div>
        </div>
      )}
      
      {/* Fixed Floating Action Button for Mobile */}
      {user && (
        <div className="lg:hidden fixed right-6 bottom-6 z-40">
          <button
            onClick={() => setShowPostForm(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
            aria-label="Create Post"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Community; 