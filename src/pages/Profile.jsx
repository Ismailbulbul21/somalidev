import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { getProfile, getImageUrl, addProject, updateProject, supabase } from '../utils/supabaseClient.js';
import SkillGroup from '../components/ui/SkillGroup';
import ProjectCard from '../components/ui/ProjectCard';
import ProjectForm from '../components/ui/ProjectForm';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  const isOwnProfile = id ? user?.id === id : true;
  const profileId = id || user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        if (!profileId) {
          navigate('/signin');
          return;
        }

        const profileData = await getProfile(profileId);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, navigate]);

  // Function to handle project form success
  const handleProjectSave = async (projectData) => {
    try {
      // Update profile data with the new/updated project
      const updatedProfile = await getProfile(profileId);
      setProfile(updatedProfile);
      
      // Close the form
      setShowProjectForm(false);
      setCurrentProject(null);
    } catch (error) {
      console.error('Error updating profile data:', error);
    }
  };
  
  // Function to handle project edit
  const handleEditProject = (projectId) => {
    const projectToEdit = profile.projects.find(p => p.id === projectId);
    if (projectToEdit) {
      setCurrentProject(projectToEdit);
      setShowProjectForm(true);
    }
  };
  
  // Function to handle project delete
  const handleDeleteProject = async (projectId) => {
    try {
      if (window.confirm('Are you sure you want to delete this project?')) {
        // Call API to delete project
        const { data, error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);
          
        if (error) throw error;
        
        // Update profile data
        const updatedProfile = await getProfile(profileId);
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Function to group skills by category
  const organizeSkillsByCategory = () => {
    if (!profile || !profile.profile_skills) return {};

    return profile.profile_skills.reduce((acc, profileSkill) => {
      const category = profileSkill.skills.category;
      
      if (!acc[category]) {
        acc[category] = {
          regular: [],
          learning: []
        };
      }
      
      if (profileSkill.is_learning) {
        acc[category].learning.push(profileSkill.skills.name);
      } else {
        acc[category].regular.push(profileSkill.skills.name);
      }
      
      return acc;
    }, {});
  };

  const skillsByCategory = organizeSkillsByCategory();

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
        <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Profile</h2>
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
        <p className="text-gray-400">This profile doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg sticky top-24">
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/40">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl font-bold">
                        {profile.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Available Status */}
                  {profile.available_for_hire && (
                    <div className="absolute bottom-2 right-2 bg-green-500 p-1 rounded-full border-2 border-gray-800">
                      <div className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-1">{profile.full_name}</h1>
                <p className="text-gray-300">{profile.title || 'Developer'}</p>
                
                {/* Experience Level */}
                {profile.experience_level && (
                  <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                    profile.experience_level === 'Bilow' || profile.experience_level === 'Junior' ? 'bg-green-900/60 text-green-300' : 
                    profile.experience_level === 'Dhexe' || profile.experience_level === 'Mid-level' ? 'bg-blue-900/60 text-blue-300' : 
                    'bg-purple-900/60 text-purple-300'
                  }`}>
                    {profile.experience_level}
                  </span>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="space-y-4 mb-6">
                {/* Location */}
                {profile.location && (
                  <div className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {/* Experience */}
                {profile.years_of_experience && (
                  <div className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{profile.years_of_experience} <span className="text-purple-300 font-semibold">{profile.years_of_experience === 1 ? 'year' : 'years'}</span> of experience</span>
                  </div>
                )}
                
                {/* Available Status */}
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{profile.available_for_hire ? 'Available for hire' : 'Not available for hire'}</span>
                </div>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-2">About</h2>
                  <p className="text-gray-300">{profile.bio}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Edit Profile Button (if own profile) */}
                {isOwnProfile ? (
                  <button 
                    onClick={() => navigate('/profile/edit')}
                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    {/* Send Message Button (if viewing someone else's profile) */}
                    <button 
                      onClick={() => navigate(`/messages?contact=${profileId}`)}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Send Message
                    </button>
                    
                    {/* Hire Button (if they are available for hire) */}
                    {profile.available_for_hire && (
                      <button 
                        onClick={() => navigate(`/messages?contact=${profileId}&subject=Job Opportunity`)}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Hire Developer
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Skills Section */}
            <motion.section
              className="mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2 
                className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2"
                variants={itemVariants}
              >
                Skills & Expertise
              </motion.h2>
              
              {Object.keys(skillsByCategory).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(skillsByCategory).map(([category, skills], index) => (
                    <motion.div key={category} variants={itemVariants}>
                      <SkillGroup
                        title={category}
                        skills={skills.regular}
                        learningSkills={skills.learning}
                        animated={false}
                        profileId={!isOwnProfile ? profileId : null}
                        showMessageIcons={!isOwnProfile}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.p variants={itemVariants} className="text-gray-400">
                  No skills added yet.
                </motion.p>
              )}
            </motion.section>
            
            {/* Projects Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2"
                variants={itemVariants}
              >
                <h2 className="text-2xl font-bold">Projects</h2>
                
                {isOwnProfile && (
                  <button 
                    onClick={() => {
                      setCurrentProject(null);
                      setShowProjectForm(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Project
                  </button>
                )}
              </motion.div>
              
              {profile.projects && profile.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.projects.map((project) => (
                    <motion.div key={project.id} variants={itemVariants}>
                      <ProjectCard 
                        project={{
                          id: project.id,
                          title: project.title,
                          description: project.description,
                          image_url: project.thumbnail_url,
                          github_url: project.github_url,
                          live_url: project.live_url,
                          created_at: project.created_at,
                          skills: project.project_skills?.map(ps => ps.skills.name) || []
                        }}
                        isOwner={isOwnProfile}
                        onEdit={isOwnProfile ? handleEditProject : null}
                        onDelete={isOwnProfile ? handleDeleteProject : null}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.p variants={itemVariants} className="text-gray-400">
                  No projects added yet.
                  {isOwnProfile && " Add your first project to showcase your work."}
                </motion.p>
              )}
            </motion.section>
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      <AnimatePresence>
        {showProjectForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProjectForm(false)}
          >
            {/* Prevent clicking inside the form from closing the modal */}
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
              <ProjectForm 
                project={currentProject}
                onSuccess={handleProjectSave}
                onCancel={() => setShowProjectForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile; 