import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSpecializations } from '../../utils/supabaseClient.js';

const ProfileCard = ({ profile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const [specializationNames, setSpecializationNames] = useState([]);
  
  // Get skills from profile
  const skills = profile.profile_skills?.map(ps => ps.skills) || [];
  
  // Get main skills (max 3)
  const mainSkills = skills.slice(0, 3);

  // Fetch specialization names when profile changes
  useEffect(() => {
    const fetchSpecializationNames = async () => {
      if (profile.specializations && profile.specializations.length > 0) {
        try {
          const allSpecializations = await getSpecializations();
          const names = profile.specializations
            .map(id => allSpecializations.find(s => s.id === id)?.name)
            .filter(Boolean); // Filter out undefined values
          setSpecializationNames(names);
        } catch (error) {
          console.error('Error fetching specializations:', error);
        }
      }
    };
    
    fetchSpecializationNames();
  }, [profile.specializations]);

  // Handle messaging about a specific skill
  const handleMessageAboutSkill = (e, skillName) => {
    e.preventDefault(); // Prevent navigating to profile
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/messages?contact=${profile.id}&subject=Skill: ${skillName}`);
  };
  
  return (
    <motion.div
      className="bg-gray-800/70 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 shadow-xl h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)'
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex items-start">
          {/* Profile image */}
          <motion.div 
            className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-purple-400/60"
            whileHover={{ scale: 1.1 }}
          >
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
            
            {/* Available indicator */}
            {profile.available_for_hire && (
              <motion.div 
                className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </motion.div>
          
          {/* Profile info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">{profile.full_name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                profile.experience_level === 'Bilow' || profile.experience_level === 'Junior' ? 'bg-green-900/60 text-green-300' : 
                profile.experience_level === 'Dhexe' || profile.experience_level === 'Mid-level' ? 'bg-blue-900/60 text-blue-300' : 
                'bg-purple-900/60 text-purple-300'
              }`}>
                {profile.experience_level || 'Bilow'}
              </span>
            </div>
            
            <p className="text-gray-300 text-sm mt-1">{profile.title || 'Developer'}</p>
            
            {/* Location */}
            {profile.location && (
              <div className="flex items-center mt-2 text-gray-400 text-xs">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{profile.location}</span>
              </div>
            )}
            
            {/* Years of experience */}
            {profile.years_of_experience && (
              <div className="flex items-center mt-1 text-gray-400 text-xs">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-300">
                  {profile.years_of_experience} <span className="text-purple-300 font-semibold">{profile.years_of_experience === 1 ? 'year' : 'years'}</span> of experience
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Specializations */}
        {specializationNames.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {specializationNames.slice(0, 3).map((specialization, index) => (
                <span 
                  key={index}
                  className="bg-purple-900/40 text-purple-200 border border-purple-700/50 px-2 py-1 rounded text-xs"
                >
                  {specialization}
                </span>
              ))}
              
              {specializationNames.length > 3 && (
                <span className="bg-purple-900/30 text-purple-200 px-2 py-1 rounded text-xs">
                  +{specializationNames.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Skills */}
        {mainSkills.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {mainSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs group flex items-center"
                >
                  {skill.name}
                  <button
                    onClick={(e) => handleMessageAboutSkill(e, skill.name)}
                    className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    title={`Message about ${skill.name}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                </span>
              ))}
              
              {skills.length > 3 && (
                <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs">
                  +{skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Learning Now */}
        {profile.profile_skills?.some(ps => ps.is_learning) && (
          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Learning Now
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.profile_skills
                .filter(ps => ps.is_learning)
                .slice(0, 2)
                .map((profileSkill, index) => (
                  <motion.span 
                    key={index}
                    className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-xs flex items-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="mr-1">{profileSkill.skills.name}</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-7 7a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </motion.span>
              ))}
            </div>
          </div>
        )}
        
        {/* Bio preview */}
        {profile.bio && (
          <div className="mt-4">
            <p className="text-gray-400 text-sm line-clamp-2">{profile.bio}</p>
          </div>
        )}
        
        {/* Action buttons */}
        <motion.div 
          className="mt-5 grid grid-cols-2 gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Link 
            to={`/profile/${profile.id}`} 
            className="py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-center rounded-md transition-colors font-medium text-sm"
          >
            View Profile
          </Link>
          
          <button
            onClick={() => navigate(`/messages?contact=${profile.id}`)}
            className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white text-center rounded-md transition-colors font-medium text-sm flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Message
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileCard; 