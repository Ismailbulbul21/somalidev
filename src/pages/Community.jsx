import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { getPosts, getCategories } from '../utils/supabaseClient.jsx';
import PostCard from '../components/ui/PostCard';
import PostForm from '../components/ui/PostForm';
import { toast } from 'react-hot-toast';
import { FiPlus, FiSearch, FiMessageCircle } from 'react-icons/fi';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  
  // Popular tags for sidebar
  const popularTags = ['javascript', 'react', 'webdev', 'design', 'career', 'mobile', 'backend'];
  
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
  
  // Filter button component
  const FilterButton = ({ children, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-purple-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
  
  // Handle filter change
  const handleFilterChange = (filter) => {
    setFilterType(filter);
    // Map filter to actual post type for API
    let type = '';
    if (filter === 'questions') type = 'question';
    if (filter === 'discussions') type = 'discussion';
    setSelectedType(type);
  };
  
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
      console.log('Setting selectedCategory from URL:', categoryId);
      
      // When we have a categoryId from the URL, we'll set the activeCategory when categories are loaded
      if (categories.length > 0) {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          setActiveCategory(category);
          console.log('Setting activeCategory from URL param with category object:', category);
        }
      }
    }
    
    fetchPosts();
  }, [categoryId, categories]);
  
  // Handle post creation success
  const handlePostSuccess = (newPost) => {
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
  
  const renderSidebar = () => {
    return (
      <div className="hidden lg:block sticky top-20 space-y-4 w-full max-w-xs">
        {/* Quick Post Creation */}
        {user ? (
          <PostForm 
            simplified={true}
            preSelectedCategory={activeCategory?.id} 
            onSuccess={(post) => {
              // Add the new post to the posts list and close the form
              setPosts((prevPosts) => [post, ...prevPosts]);
              toast.success('Post created successfully!');
            }}
          />
        ) : (
          <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Join the conversation</h3>
            <p className="text-gray-400 text-sm mb-3">Sign in to share your thoughts and connect with the community.</p>
            <Link 
              to="/login" 
              className="w-full block text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
        
        {/* Popular Topics */}
        <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Popular Topics</h3>
          <div className="space-y-2">
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchParams(prev => {
                    const params = new URLSearchParams(prev);
                    params.set('tag', tag);
                    return params;
                  });
                }}
                className="block w-full text-left px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 text-sm transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-12">
      <div className="container mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">Community</h1>
        </div>

        {/* Category Navigation */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Posts
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2 w-4 h-4">
                  {getCategoryIcon(category.name)}
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main content and sidebar layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content area */}
          <div className="flex-1 order-2 lg:order-1">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      setSearchParams(prev => {
                        const params = new URLSearchParams(prev);
                        params.set('search', e.target.value);
                        return params;
                      });
                    } else {
                      setSearchParams(prev => {
                        const params = new URLSearchParams(prev);
                        params.delete('search');
                        return params;
                      });
                    }
                  }}
                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex w-full sm:w-auto space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setSearchParams(prev => {
                      const params = new URLSearchParams(prev);
                      params.set('sort', e.target.value);
                      return params;
                    });
                  }}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                </select>
                
                <FilterButton
                  isActive={filterType === 'all'}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </FilterButton>
                <FilterButton
                  isActive={filterType === 'questions'}
                  onClick={() => handleFilterChange('questions')}
                >
                  Questions
                </FilterButton>
                <FilterButton
                  isActive={filterType === 'discussions'}
                  onClick={() => handleFilterChange('discussions')}
                >
                  Discussions
                </FilterButton>
              </div>
            </div>

            {/* Posts list */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onDelete={() => fetchPosts()}
                  />
                ))}
                
                {/* Load More button */}
                {totalPages > page && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-8 text-center">
                <FiMessageCircle className="mx-auto text-gray-600 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery ? 
                    `No posts match your search for "${searchQuery}"` : 
                    'Be the first to start a conversation!'
                  }
                </p>
                {user && (
                  <button
                    onClick={() => setShowNewPostForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Create Post
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Post Form sidebar */}
          <div className="w-full lg:w-96 lg:flex-shrink-0 order-1 lg:order-2 mb-6 lg:mb-0 lg:sticky lg:top-20 lg:self-start">
            {user ? (
              <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Start a conversation</h3>
                <PostForm 
                  simplified={true}
                  preSelectedCategory={activeCategory?.id} 
                  onSuccess={(post) => {
                    // Add the new post to the posts list
                    setPosts((prevPosts) => [post, ...prevPosts]);
                    toast.success('Post created successfully!');
                  }}
                />
              </div>
            ) : (
              <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Join the conversation</h3>
                <p className="text-gray-400 text-sm mb-3">Sign in to share your thoughts and connect with the community.</p>
                <Link 
                  to="/login" 
                  className="w-full block text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
            
            {/* Popular Topics */}
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-white mb-3">Popular Topics</h3>
              <div className="space-y-2">
                {popularTags?.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchParams(prev => {
                        const params = new URLSearchParams(prev);
                        params.set('tag', tag);
                        return params;
                      });
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 text-sm transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Community; 