import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { getProfile, updateProfile, supabase } from '../utils/supabaseClient.js';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    experience_level: '',
    available_for_hire: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile(user.id);
        setProfile(profileData);
        
        // Initialize form with profile data
        setFormData({
          full_name: profileData.full_name || '',
          username: profileData.username || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          github_url: profileData.github_url || '',
          linkedin_url: profileData.linkedin_url || '',
          twitter_url: profileData.twitter_url || '',
          experience_level: profileData.experience_level || '',
          available_for_hire: profileData.available_for_hire || false
        });
        
        // Set avatar preview if exists
        if (profileData.avatar_url) {
          setAvatarPreview(profileData.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    try {
      // Create a unique file path
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, avatarFile, {
          upsert: true,
          contentType: avatarFile.type
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      
      // Validate before submitting
      if (!formData.full_name.trim()) {
        setError('Name is required');
        setSaving(false);
        return;
      }
      
      // Prepare updates object
      const updates = { ...formData };
      
      // Handle avatar upload if changed
      if (avatarFile) {
        const avatarUrl = await uploadAvatar();
        if (avatarUrl) {
          updates.avatar_url = avatarUrl;
        }
      }
      
      // Update profile
      await updateProfile(user.id, updates);
      
      setMessage('Profile updated successfully');
      
      // Navigate back to profile page after a short delay
      setTimeout(() => {
        navigate(`/profile/${user.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg p-6 md:p-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-2xl md:text-3xl font-bold mb-6 pb-4 border-b border-gray-700"
            variants={itemVariants}
          >
            Edit Profile
          </motion.h1>
          
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}
          
          {message && (
            <motion.div 
              className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200"
              variants={itemVariants}
            >
              {message}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <motion.div 
                className="md:col-span-2 flex flex-col items-center justify-center mb-6"
                variants={itemVariants}
              >
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/40 shadow-lg">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt={formData.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl font-bold">
                        {formData.full_name.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2.5 shadow-lg transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-sm text-gray-400">Click the edit icon to upload a new profile picture</p>
              </motion.div>
              
              {/* Basic Info */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Username *</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Experience Level *</label>
                <select 
                  name="experience_level" 
                  value={formData.experience_level} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Experience Level</option>
                  <option value="Bilow">Bilow</option>
                  <option value="Dhexe">Dhexe</option>
                  <option value="Sare">Sare</option>
                </select>
              </motion.div>
              
              <motion.div className="md:col-span-2" variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio *</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  rows="4" 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tell others about yourself, your skills, and interests"
                  required
                ></textarea>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location *</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g. New York, USA"
                  required
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="flex items-center space-x-2 cursor-pointer py-2">
                  <input 
                    type="checkbox" 
                    name="available_for_hire" 
                    checked={formData.available_for_hire} 
                    onChange={handleChange} 
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 bg-gray-700 border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-300">Available for hire</span>
                </label>
              </motion.div>

              {/* Specializations Section */}
              <motion.div className="md:col-span-2 mt-6" variants={itemVariants}>
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Specializations *</h2>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Select at least one specialization to let others know your expertise areas</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.location.href = "/profile/specializations"}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors flex items-center"
                  >
                    Select Specializations
                  </button>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div className="md:col-span-2 mt-6" variants={itemVariants}>
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Social Links</h2>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                <input 
                  type="url" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">GitHub</label>
                <input 
                  type="url" 
                  name="github_url" 
                  value={formData.github_url} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn</label>
                <input 
                  type="url" 
                  name="linkedin_url" 
                  value={formData.linkedin_url} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
                <input 
                  type="url" 
                  name="twitter_url" 
                  value={formData.twitter_url} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://twitter.com/username"
                />
              </motion.div>
            </div>
            
            {/* Submit Buttons */}
            <motion.div 
              className="flex justify-end space-x-4 mt-8"
              variants={itemVariants}
            >
              <button
                type="button"
                onClick={() => navigate(`/profile/${user.id}`)}
                className="px-6 py-2.5 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile; 