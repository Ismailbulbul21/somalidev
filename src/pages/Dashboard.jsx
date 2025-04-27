import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { getProfile, getMessages } from '../utils/supabaseClient.js';
import SyncCategoriesButton from '../components/ui/SyncCategoriesButton';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    profileCompletion: 0,
    skillsCount: 0,
    projectsCount: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          navigate('/signin');
          return;
        }

        // Fetch profile data
        const profileData = await getProfile(user.id);
        setProfile(profileData);
        
        // Fetch messages
        const messagesData = await getMessages(user.id);
        setMessages(messagesData);
        
        // Calculate profile completion
        calculateStats(profileData, messagesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const calculateStats = (profileData, messagesData) => {
    if (!profileData) return;
    
    // Profile completion calculation
    const requiredFields = ['full_name', 'title', 'bio', 'location', 'experience_level', 'years_of_experience', 'avatar_url'];
    let completedFields = 0;
    
    requiredFields.forEach(field => {
      if (profileData[field]) completedFields++;
    });
    
    // Add skills and projects to completion calculation
    const hasSkills = profileData.profile_skills && profileData.profile_skills.length > 0;
    const hasProjects = profileData.projects && profileData.projects.length > 0;
    
    if (hasSkills) completedFields++;
    if (hasProjects) completedFields++;
    
    const totalFields = requiredFields.length + 2; // +2 for skills and projects
    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    
    // Unread messages count
    const unreadMessages = messagesData.filter(msg => !msg.read && msg.receiver_id === user.id).length;
    
    setStats({
      profileCompletion: completionPercentage,
      skillsCount: profileData.profile_skills ? profileData.profile_skills.length : 0,
      projectsCount: profileData.projects ? profileData.projects.length : 0,
      unreadMessages
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12 text-center px-4">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Dashboard</h2>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12 text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="text-gray-400">We couldn't find your profile information.</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard
        </motion.h1>

        {/* Admin Section - Only visible for admin users */}
        {profile && profile.role === 'admin' && (
          <motion.div
            className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold mb-4 text-purple-400">Admin Tools</h2>
            <SyncCategoriesButton />
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div 
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 mb-8 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/40">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold">
                  {profile.full_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome back, {profile.full_name}!</h2>
              <p className="text-gray-300">{profile.title || 'Developer'}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Completion */}
          <motion.div 
            className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg"
            variants={itemVariants}
          >
            <h3 className="text-lg font-medium text-gray-300 mb-2">Profile Completion</h3>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">{stats.profileCompletion}%</span>
            </div>
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full" 
                style={{ width: `${stats.profileCompletion}%` }}
              ></div>
            </div>
            <div className="mt-4">
              <Link 
                to="/profile/edit" 
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
              >
                Complete your profile
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
          
          {/* Skills Count */}
          <motion.div 
            className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg"
            variants={itemVariants}
          >
            <h3 className="text-lg font-medium text-gray-300 mb-2">My Skills</h3>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">{stats.skillsCount}</span>
              <span className="text-gray-400">skills added</span>
            </div>
            <div className="mt-4">
              <Link 
                to="/profile/edit" 
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
              >
                Manage skills
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
          
          {/* Projects Count */}
          <motion.div 
            className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg"
            variants={itemVariants}
          >
            <h3 className="text-lg font-medium text-gray-300 mb-2">My Projects</h3>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">{stats.projectsCount}</span>
              <span className="text-gray-400">projects showcased</span>
            </div>
            <div className="mt-4">
              <Link 
                to="/profile" 
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
              >
                Add a project
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
          
          {/* Messages */}
          <motion.div 
            className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg"
            variants={itemVariants}
          >
            <h3 className="text-lg font-medium text-gray-300 mb-2">Messages</h3>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">{stats.unreadMessages}</span>
              <span className="text-gray-400">unread messages</span>
            </div>
            <div className="mt-4">
              <Link 
                to="/messages" 
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
              >
                View messages
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/profile/edit" className="flex items-center p-4 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
              <div className="mr-4 bg-purple-900/40 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span>Edit Profile</span>
            </Link>
            <Link to="/categories" className="flex items-center p-4 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
              <div className="mr-4 bg-blue-900/40 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span>Explore Categories</span>
            </Link>
            <Link to="/developers" className="flex items-center p-4 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
              <div className="mr-4 bg-green-900/40 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span>Find Developers</span>
            </Link>
            <Link to="/profile" className="flex items-center p-4 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
              <div className="mr-4 bg-yellow-900/40 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span>View Public Profile</span>
            </Link>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="flex items-start border-b border-gray-700 pb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-lg font-bold">
                        {message.sender_name ? message.sender_name.charAt(0) : '?'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{message.sender_name || 'Unknown User'}</h4>
                        <span className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No recent activities to show.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start connecting with other developers to see activity here.
                </p>
              </div>
            )}
            {messages.length > 5 && (
              <div className="mt-4 text-center">
                <Link 
                  to="/messages" 
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View all messages
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4">Suggested Actions</h2>
          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="space-y-3">
              {stats.profileCompletion < 100 && (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-900/40 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300">Complete your profile to increase visibility</p>
                    <Link to="/profile/edit" className="text-purple-400 hover:text-purple-300 text-sm mt-1 inline-block">
                      Update profile
                    </Link>
                  </div>
                </div>
              )}
              
              {stats.skillsCount === 0 && (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300">Add skills to your profile to match with opportunities</p>
                    <Link to="/profile/edit" className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block">
                      Add skills
                    </Link>
                  </div>
                </div>
              )}
              
              {stats.projectsCount === 0 && (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300">Showcase your work by adding projects</p>
                    <Link to="/profile" className="text-green-400 hover:text-green-300 text-sm mt-1 inline-block">
                      Add a project
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-yellow-900/40 flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300">Connect with other developers in your field</p>
                  <Link to="/developers" className="text-yellow-400 hover:text-yellow-300 text-sm mt-1 inline-block">
                    Browse developers
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 