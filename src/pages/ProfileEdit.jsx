import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import {
  supabase,
  getProfile,
  uploadImage,
  getImageUrl,
  updatePrimaryCategories,
  getSpecializations,
  updateSpecializations,
  getCategories
} from '../utils/supabaseClient.js';
import { updateProfileSafe } from '../utils/profileUpdater.js';
import { FiX, FiCheck, FiSearch, FiChevronRight } from 'react-icons/fi';
import SpecializationManager from '../components/ui/SpecializationManager';

// Somalia cities and regions
const SOMALIA_CITIES = [
  "Mogadishu (Capital)",
  "Hargeisa",
  "Kismayo",
  "Bosaso",
  "Galkayo",
  "Berbera",
  "Baidoa",
  "Beledweyne",
  "Marka",
  "Jowhar",
  "Garowe",
  "Burao",
  "Afgooye",
  "Borama",
  "Erigavo",
  "Las Anod",
  "Bardera",
  "Qardho",
  "Gabiley",
  "Hudur",
  "Baki",
  "jigjiga",
];

const SOMALIA_REGIONS = [
  "Banadir",
  "Awdal",
  "Woqooyi Galbeed",
  "Togdheer",
  "Sanaag",
  "Sool",
  "Nugal",
  "Bari",
  "Mudug",
  "Galguduud",
  "Hiiraan",
  "Middle Shabelle",
  "Lower Shabelle",
  "Bay",
  "Bakool",
  "Gedo",
  "Middle Juba",
  "Lower Juba",
];

const ProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form states
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    years_of_experience: '',
    experience_level: 'Bilow',
    available_for_hire: false,
    avatar_url: '',
    username: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Primary Categories states
  const [primaryCategories, setPrimaryCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Specializations states
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  
  // Fetch user profile data and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('User ID not available');
        setError('User not authenticated. Please sign in.');
        return;
      }
      
      // Fetch profile data
      const profileData = await getProfile(user.id);
      console.log('Fetched profile data:', profileData);
      
      if (!profileData) {
        console.error('No profile data returned');
        setError('Profile data not found');
        return;
      }
      
      setProfile(profileData);
      
      // Fetch available categories
      const categoriesData = await getCategories();
      console.log('Fetched categories:', categoriesData);
      setAvailableCategories(categoriesData || []);
      
      // Fetch available specializations
      const specializationsData = await getSpecializations();
      console.log('Fetched specializations:', specializationsData);
      setAvailableSpecializations(specializationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [user?.id]); // Only re-run if user ID changes
  
  // Initialize form data when profile is loaded
  useEffect(() => {
    if (profile) {
      console.log("Setting form data from profile:", profile);
      
      // Initialize form data from profile
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        location: profile.location || '',
        bio: profile.bio || '',
        years_of_experience: profile.years_of_experience || '',
        experience_level: profile.experience_level || '',
        available_for_hire: profile.available_for_hire || false,
        website: profile.website || '',
        github: profile.github || '',
        twitter: profile.twitter || '',
        linkedin: profile.linkedin || '',
        avatar_url: profile.avatar_url || '',
      });
      
      // Initialize primary categories
      if (profile.primary_categories && Array.isArray(profile.primary_categories)) {
        console.log("Setting primary categories from profile:", profile.primary_categories);
        setPrimaryCategories(profile.primary_categories);
      }
      
      // Initialize specializations
      if (profile.specializations && Array.isArray(profile.specializations)) {
        console.log("Setting specializations from profile:", profile.specializations);
        setSelectedSpecializations(profile.specializations);
      }
    }
  }, [profile]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle avatar image upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      // Update the file path to include user ID as the first folder
      const filePath = `${user.id}/${fileName}`;

      // Upload image to Supabase Storage
      // Use 'profile-images' bucket instead of 'avatars' since that's what exists in the project
      await uploadImage('profile-images', filePath, file);

      // Get the public URL
      const avatarUrl = getImageUrl('profile-images', filePath);

      // Update form data with new avatar URL
      setFormData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));

      setSuccess('Profile picture uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Handle category toggle
  const handleCategoryToggle = (categoryId) => {
    setPrimaryCategories(current => {
      if (current.includes(categoryId)) {
        return current.filter(id => id !== categoryId);
      } else {
        return [...current, categoryId];
      }
    });
  };
  
  // Handle specialization toggle
  const handleSpecializationToggle = (specializationId) => {
    setSelectedSpecializations(current => {
      if (current.includes(specializationId)) {
        return current.filter(id => id !== specializationId);
      } else {
        return [...current, specializationId];
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      console.log("Form submission initiated with data:", formData);
      console.log("Selected specializations:", selectedSpecializations);
      console.log("Primary categories:", primaryCategories);
      
      if (!user?.id) {
        setError('You must be signed in to update your profile.');
        return;
      }

      // Validate required fields - with improved validation logic
      const requiredFields = {
        'full_name': 'Full name is required',
        'location': 'Location is required',
        'bio': 'Bio is required',
        'years_of_experience': 'Years of experience is required'
      };
      
      // Check each required field
      for (const [field, errorMsg] of Object.entries(requiredFields)) {
        if (!formData[field] || String(formData[field]).trim().length === 0) {
          console.log(`Validation failed for field: ${field}`);
          setError(errorMsg);
          return;
        }
      }

      // Only validate specializations if it's a new user or they don't have any yet
      if (selectedSpecializations.length === 0 && (!profile?.specializations || profile.specializations.length === 0)) {
        console.log("Validation failed: No specializations selected");
        setError('Please select at least one specialization');
        return;
      }

      setSaving(true);
      
      // Remove years_experience field as it's duplicated (we use years_of_experience instead)
      const { years_experience, ...formDataWithoutDuplicate } = formData;
      
      // Clean and validate the form data
      const profileUpdates = {};
      
      // Process each field, only include non-empty values
      Object.entries(formDataWithoutDuplicate).forEach(([key, value]) => {
        // Skip empty strings but allow boolean false and number 0
        if (value === '' || value === undefined || value === null) {
          return;
        }
        
        // Special handling for years_of_experience
        if (key === 'years_of_experience') {
          if (value) {
            const parsedValue = parseInt(value);
            if (isNaN(parsedValue)) {
              throw new Error('Years of experience must be a number');
            }
            profileUpdates[key] = parsedValue;
          } else {
            // Include it as null to clear existing value
            profileUpdates[key] = null;
          }
        } else {
          profileUpdates[key] = value;
        }
      });
      
      console.log('Updating profile with:', profileUpdates);
      
      // Update the profile using our enhanced safe method that handles all updates in one call
      await updateProfileSafe(user.id, profileUpdates, primaryCategories, selectedSpecializations);
      
      // Refresh the profile data
      const updatedProfile = await getProfile(user.id);
      setProfile(updatedProfile);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile`);
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.message) {
        setError(`Failed to update profile: ${error.message}`);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Edit Your Profile
        </motion.h1>
        
        {/* Error/Success Messages */}
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-red-900/60 text-red-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            className="mb-6 p-4 bg-green-900/60 text-green-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {success}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Profile Form */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">Personal Information</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Profile Picture Upload */}
                <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/40 bg-gray-700 group">
                      {formData.avatar_url ? (
                        <img 
                          src={formData.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl font-bold">
                          {formData.full_name ? formData.full_name.charAt(0) : '?'}
                        </div>
                      )}
                      
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <span className="text-white text-sm">Change</span>
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="mt-3 w-full py-1.5 px-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : 'Upload Picture'}
                    </button>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-md font-medium text-gray-300 mb-2">Profile Picture</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Upload a professional photo for your profile. A clear headshot with a neutral background is recommended.
                    </p>
                    <p className="text-xs text-gray-500">
                      Accepted formats: JPEG, PNG, GIF, WEBP. Maximum size: 2MB.
                    </p>
                    
                    {formData.avatar_url && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-400 break-all">
                          {formData.avatar_url}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                          className="ml-2 text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="full_name">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
                      required
                    />
                  </div>
                  
                  {/* Location - Now a dropdown with option groups */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="location">
                      Location *
                    </label>
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white appearance-none cursor-pointer"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem" }}
                      required
                    >
                      <option value="">Select a location in Somalia</option>
                      <optgroup label="Major Cities">
                        {SOMALIA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Regions">
                        {SOMALIA_REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">Select the city or region in Somalia where you are located</p>
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="bio">
                    Bio *
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    placeholder="Tell others about yourself"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="years_of_experience">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      id="years_of_experience"
                      name="years_of_experience"
                      min="0"
                      max="40"
                      value={formData.years_of_experience}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
                      required
                    />
                  </div>
                
                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Experience Level *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Bilow', 'Dhexe', 'Sare'].map((level) => (
                        <label 
                          key={level}
                          className={`
                            flex items-center justify-center p-3 border rounded-md cursor-pointer
                            ${formData.experience_level === level ? 
                              'border-purple-500 bg-purple-900/30 text-purple-200' : 
                              'border-gray-600 bg-gray-700/40 text-gray-300 hover:bg-gray-700/60'}
                          `}
                        >
                          <input
                            type="radio"
                            name="experience_level"
                            value={level}
                            checked={formData.experience_level === level}
                            onChange={handleChange}
                            className="sr-only"
                            required
                          />
                          {level}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Specializations Section */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-200">
                    Developer Specializations *
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Select your areas of specialization. This helps companies find you based on your expertise.
                  </p>
                  
                  <SpecializationManager 
                    selectedIds={selectedSpecializations}
                    onChange={setSelectedSpecializations}
                  />
                </div>
                
                {/* Available for Hire */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="available_for_hire"
                      checked={formData.available_for_hire}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-purple-600 rounded bg-gray-700 border-gray-500"
                    />
                    <span className="text-gray-300">Available for hire</span>
                  </label>
                </div>
                
                {/* New Primary Categories Section */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Primary Categories
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select categories that best describe your expertise. These will help others find you.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableCategories.map((category) => (
                      <div 
                        key={category.id} 
                        className={`
                          flex items-center p-3 rounded-lg cursor-pointer transition-all
                          ${primaryCategories.includes(category.id) 
                            ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500' 
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'}
                        `}
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 dark:text-gray-200">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description || `Skills related to ${category.name}`}
                          </p>
                        </div>
                        <div className={`
                          w-6 h-6 flex items-center justify-center rounded-full
                          ${primaryCategories.includes(category.id) 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-gray-300 dark:bg-gray-600'}
                        `}>
                          {primaryCategories.includes(category.id) && <FiCheck />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Form Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`
                      px-5 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 
                      hover:from-purple-700 hover:to-blue-700 text-white font-medium
                      ${saving ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="px-5 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit; 