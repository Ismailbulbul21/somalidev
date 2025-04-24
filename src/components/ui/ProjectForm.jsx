import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { addProject, updateProject, uploadImage, getImageUrl } from '../../utils/supabaseClient.js';
import { useAuth } from '../../utils/AuthContext';

const ProjectForm = ({ 
  project = null, 
  onSuccess = () => {}, 
  onCancel = () => {} 
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const isEditing = !!project;
  
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    github_url: project?.github_url || '',
    live_url: project?.live_url || '',
    thumbnail_url: project?.thumbnail_url || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = async (e) => {
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
      const fileName = `project_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/projects/${fileName}`;

      console.log('Uploading to bucket: project-images, path:', filePath);
      
      // Upload image to Supabase Storage - using the correct bucket name
      const data = await uploadImage('project-images', filePath, file);
      
      console.log('Upload successful:', data);

      // Get the public URL
      const thumbnailUrl = getImageUrl('project-images', filePath);
      console.log('Generated thumbnail URL:', thumbnailUrl);

      // Update form data with new thumbnail URL
      setFormData(prev => ({
        ...prev,
        thumbnail_url: thumbnailUrl
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      // More detailed error message to help with debugging
      let errorMessage = 'Failed to upload image. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else if (error.error_description) {
        errorMessage += error.error_description;
      } else if (error.statusText) {
        errorMessage += `Server responded with: ${error.statusText}`;
      }
      
      setError(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('You must be signed in to add a project');
        return;
      }
      
      // Validate form
      if (!formData.title.trim()) {
        setError('Project title is required');
        return;
      }
      
      // Prepare project data
      const projectData = {
        ...formData,
        profile_id: user.id,
      };
      
      console.log('Submitting project data:', JSON.stringify(projectData, null, 2));
      
      let result;
      
      if (isEditing) {
        // Update existing project
        console.log('Updating existing project ID:', project.id);
        result = await updateProject(project.id, projectData);
      } else {
        // Add new project
        console.log('Adding new project');
        try {
          result = await addProject(projectData);
          console.log('Project saved successfully:', result);
        } catch (innerError) {
          console.error('Detailed error saving project:', innerError);
          if (innerError.details) console.error('Error details:', innerError.details);
          if (innerError.hint) console.error('Error hint:', innerError.hint);
          throw innerError;
        }
      }
      
      onSuccess(result);
      
    } catch (error) {
      console.error('Error saving project:', error);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to save project. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else if (error.error_description) {
        errorMessage += error.error_description;
      } else if (error.code) {
        errorMessage += `Error code: ${error.code}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-md p-6 rounded-lg border border-gray-700 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">
        {isEditing ? 'Edit Project' : 'Add New Project'}
      </h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/60 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Project Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="title">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
            required
          />
        </div>
        
        {/* Project Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
          />
        </div>
        
        {/* GitHub URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="github_url">
            GitHub URL
          </label>
          <input
            type="url"
            id="github_url"
            name="github_url"
            value={formData.github_url}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
            placeholder="https://github.com/yourusername/project"
          />
        </div>
        
        {/* Live URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="live_url">
            Live URL
          </label>
          <input
            type="url"
            id="live_url"
            name="live_url"
            value={formData.live_url}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
            placeholder="https://yourproject.com"
          />
        </div>
        
        {/* Project Thumbnail */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Thumbnail
          </label>
          
          <div className="flex items-center gap-4">
            {formData.thumbnail_url ? (
              <div className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-600">
                <img 
                  src={formData.thumbnail_url} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                  className="absolute top-1 right-1 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-white"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-md border border-dashed border-gray-600 flex items-center justify-center bg-gray-700/50">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Uploading...' : formData.thumbnail_url ? 'Change Image' : 'Upload Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-gray-400">
                Max size: 2MB. Formats: JPEG, PNG, GIF, WEBP
              </p>
            </div>
          </div>
        </div>
        
        {/* Form Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading || uploadingImage}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : isEditing ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProjectForm; 