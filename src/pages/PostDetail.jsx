import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { 
  getPost, 
  deletePost,
  togglePostLike,
  togglePostSave
} from '../utils/supabaseClient.jsx';
import CommentForm from '../components/ui/CommentForm';
import CommentItem from '../components/ui/CommentItem';
import PostForm from '../components/ui/PostForm';
import defaultAvatar from '../assets/images/default-avatar.svg';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch post data
  const fetchPost = async () => {
    setLoading(true);
    
    try {
      const result = await getPost(id);
      setPost(result);
      setComments(result.comments || []);
      setLiked(result.user_has_liked || false);
      setLikeCount(result.like_count || 0);
      setSaved(result.user_has_saved || false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Could not load post. It may have been deleted or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Handle comment success
  const handleCommentSuccess = (newComment) => {
    setComments(prev => [newComment, ...prev]);
  };
  
  // Handle comment update
  const handleCommentUpdate = (updatedComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };
  
  // Handle comment delete
  const handleCommentDelete = (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };
  
  // Handle post like
  const handleLike = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await togglePostLike(post.id);
      setLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle post save
  const handleSave = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await togglePostSave(post.id);
      setSaved(result.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle post delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deletePost(post.id);
      navigate('/community', { replace: true });
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle post update success
  const handleUpdateSuccess = (updatedPost) => {
    setPost({...post, ...updatedPost});
    setIsEditing(false);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  // Error state
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center max-w-2xl mx-auto">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-white">Post not found</h2>
          <p className="mt-2 text-gray-400">{error}</p>
          <Link
            to="/community"
            className="mt-6 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Go back to Community
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex text-sm">
            <Link to="/community" className="text-gray-400 hover:text-white transition-colors">
              Community
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gray-300 truncate">{post.title}</span>
          </nav>
        </div>
        
        {isEditing ? (
          <PostForm 
            post={post} 
            onSuccess={handleUpdateSuccess} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Link to={`/profile/${post.profile?.id}`} className="flex items-center">
                  <img 
                    src={post.profile?.avatar_url || defaultAvatar} 
                    alt={post.profile?.full_name || 'User'} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h3 className="text-white font-medium">{post.profile?.full_name || 'Anonymous'}</h3>
                    <p className="text-gray-400 text-sm">{formatDate(post.created_at)}</p>
                  </div>
                </Link>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{post.title}</h1>
              
              {/* Post Type Badge */}
              {post.post_type && (
                <div className="inline-block bg-purple-900/40 text-purple-200 border border-purple-700/50 px-2 py-1 rounded text-xs mb-4">
                  {post.post_type}
                </div>
              )}
              
              {/* Post Content */}
              <div className="prose prose-invert max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              
              {/* Post Media */}
              {((post.media && post.media.length > 0) || (post.images && post.images.length > 0)) && (
                <div className="mb-6">
                  <img 
                    src={(post.media && post.media.length > 0) ? post.media[0].url : post.images[0]} 
                    alt="Post media" 
                    className="rounded-lg max-h-96 w-auto mx-auto"
                  />
                </div>
              )}
              
              {/* Post Stats and Actions */}
              <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-800">
                <div className="flex space-x-6">
                  {/* Like Button */}
                  <button 
                    onClick={handleLike}
                    className={`flex items-center text-sm ${liked ? 'text-purple-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-1.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{likeCount} Likes</span>
                  </button>
                  
                  {/* Comment Count */}
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{comments.length} Comments</span>
                  </div>
                  
                  {/* View Count */}
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{post.view_count || 0} Views</span>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-4 sm:mt-0">
                  {/* Save Button */}
                  <button 
                    onClick={handleSave}
                    className={`flex items-center text-sm ${saved ? 'text-yellow-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    disabled={isLoading}
                    aria-label={saved ? 'Unsave post' : 'Save post'}
                  >
                    <svg className="w-5 h-5 mr-1.5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </button>
                  
                  {/* Post Owner Actions */}
                  {user && post.profile_id === user.id && (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                        aria-label="Edit post"
                      >
                        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                      
                      <button 
                        onClick={handleDelete}
                        className="flex items-center text-sm text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete post"
                        disabled={isLoading}
                      >
                        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.article>
        )}
        
        {/* Comments Section */}
        <div className="mt-8" id="comments">
          <h2 className="text-xl font-semibold text-white mb-6">Comments ({comments.length})</h2>
          
          {/* Comment Form */}
          <div className="mb-8">
            <CommentForm 
              postId={post.id} 
              onSuccess={handleCommentSuccess} 
            />
          </div>
          
          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              {comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onDelete={handleCommentDelete}
                  onUpdate={handleCommentUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 