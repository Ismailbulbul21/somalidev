import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { getPosts, getCategories } from '../utils/supabaseClient.jsx';
import PostCard from '../components/ui/PostCard';
import PostForm from '../components/ui/PostForm';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  
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
  
  // Update URL when filters change
  useEffect(() => {
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
    
  }, [selectedCategory, selectedType, searchQuery, sortBy, sortOrder, page, navigate]);
  
  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true);
    
    try {
      const result = await getPosts({
        page,
        pageSize,
        category: selectedCategory,
        postType: selectedType,
        search: searchQuery.trim() || null,
        sortBy,
        sortOrder
      });
      
      setPosts(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      setCategories(result);
      
      // Find active category details if we have a categoryId
      if (selectedCategory && result) {
        const category = result.find(cat => cat.id === selectedCategory);
        setActiveCategory(category);
      } else {
        setActiveCategory(null);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  // Fetch data when filters change
  useEffect(() => {
    fetchPosts();
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
    fetchCategories();
    
    // Sync state with URL params
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
    
    fetchPosts();
  }, [categoryId]);
  
  // Handle post creation success
  const handlePostSuccess = (newPost) => {
    setShowNewPostForm(false);
    fetchPosts(); // Refresh posts
  };
  
  // Select a category
  const handleCategorySelect = (catId) => {
    if (catId === selectedCategory) {
      // Clicking the active category again deselects it
      setSelectedCategory('');
      setActiveCategory(null);
    } else {
      setSelectedCategory(catId);
      const category = categories.find(cat => cat.id === catId);
      setActiveCategory(category);
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
  
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
              {activeCategory ? activeCategory.name : 'Community'}
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {activeCategory 
              ? activeCategory.description || `Explore discussions, questions, and resources about ${activeCategory.name}.`
              : 'Join the conversation, ask questions, share your projects, and connect with other developers.'}
          </p>
        </motion.div>
        
        {/* Category Navigation */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => handleCategorySelect('')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                !selectedCategory 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All Posts
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">
                  {getCategoryIcon(category.name)}
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Actions and Filters */}
        <div className="mb-8 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* New Post Button */}
            <div className="w-full md:w-auto">
              {user ? (
                <button
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {showNewPostForm ? 'Cancel' : 'Create New Post'}
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In to Post
                </Link>
              )}
            </div>
            
            {/* Filters Group */}
            <div className="flex-grow">
              <details className="group w-full" open>
                <summary className="flex items-center justify-between text-white cursor-pointer mb-2">
                  <h3 className="text-sm font-medium">Filters & Search</h3>
                  <svg className="w-5 h-5 group-open:rotate-180 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </summary>
                <div className="mt-2 space-y-3">
                  {/* Search input */}
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 pl-10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    <svg 
                      className="absolute left-3 top-3 w-4 h-4 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Type Filter */}
                    <div>
                      <label htmlFor="postType" className="block text-gray-400 text-sm mb-1">Post Type</label>
                      <select
                        id="postType"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      >
                        {postTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Sort Field */}
                    <div>
                      <label htmlFor="sortBy" className="block text-gray-400 text-sm mb-1">Sort By</label>
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Sort Direction */}
                    <div>
                      <label htmlFor="sortOrder" className="block text-gray-400 text-sm mb-1">Sort Direction</label>
                      <button
                        id="sortOrder"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="w-full flex justify-between items-center bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-750"
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
                  
                  {/* Applied filters tags */}
                  {(selectedType || searchQuery || sortBy !== 'created_at' || sortOrder !== 'desc') && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <div className="text-gray-400 text-sm">Applied Filters:</div>
                      {selectedType && (
                        <div className="bg-purple-900/40 text-white text-sm px-3 py-1 rounded-full flex items-center">
                          <span className="mr-1">Type: {postTypes.find(t => t.value === selectedType)?.label}</span>
                          <button onClick={() => setSelectedType('')} className="ml-1 text-gray-300 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {searchQuery && (
                        <div className="bg-purple-900/40 text-white text-sm px-3 py-1 rounded-full flex items-center">
                          <span className="mr-1">Search: {searchQuery}</span>
                          <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-300 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {(sortBy !== 'created_at' || sortOrder !== 'desc') && (
                        <div className="bg-purple-900/40 text-white text-sm px-3 py-1 rounded-full flex items-center">
                          <span className="mr-1">
                            Sort: {sortOptions.find(o => o.value === sortBy)?.label} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
                          </span>
                          <button 
                            onClick={() => {
                              setSortBy('created_at');
                              setSortOrder('desc');
                            }} 
                            className="ml-1 text-gray-300 hover:text-white"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {(selectedType || searchQuery || sortBy !== 'created_at' || sortOrder !== 'desc') && (
                        <button 
                          onClick={() => {
                            setSelectedType('');
                            setSearchQuery('');
                            setSortBy('created_at');
                            setSortOrder('desc');
                          }}
                          className="text-purple-400 hover:text-purple-300 text-sm underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
        
        {/* New Post Form */}
        {showNewPostForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden"
          >
            <PostForm 
              preSelectedCategory={selectedCategory}
              onSuccess={handlePostSuccess}
              onCancel={() => setShowNewPostForm(false)}
            />
          </motion.div>
        )}
        
        {/* Active Category Banner - only shown when a category is selected */}
        {activeCategory && (
          <div className="mb-8 bg-purple-900/20 border border-purple-800/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-purple-900/60 rounded-full mr-3">
                {getCategoryIcon(activeCategory.name)}
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">{activeCategory.name}</h3>
                <p className="text-gray-400 text-sm">{activeCategory.description || `Viewing posts about ${activeCategory.name}`}</p>
              </div>
            </div>
            <button
              onClick={() => handleCategorySelect('')}
              className="text-gray-400 hover:text-white p-2"
              aria-label="Clear category filter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-white">No posts found</h3>
            <p className="mt-2 text-gray-400">
              {searchQuery || selectedCategory || selectedType
                ? 'Try changing your search or filters'
                : 'Be the first to start a conversation'}
            </p>
            {(!searchQuery && user) && (
              <button
                onClick={() => setShowNewPostForm(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Create New Post
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
              />
            ))}
          </motion.div>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md ${
                  page === 1
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded-md ${
                  page === totalPages
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
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
    </div>
  );
};

export default Community; 