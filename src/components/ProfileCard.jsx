import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { getSpecializations } from '../utils/supabaseClient.js';

const ProfileCard = ({ profile }) => {
  const navigate = useNavigate();
  const [specializationNames, setSpecializationNames] = useState([]);
  
  // Get skills from profile
  const skills = profile.profile_skills?.map(ps => ps.skills.name) || [];
  
  // Get up to 3 skills to display
  const displaySkills = skills.slice(0, 3);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Social media links
  const socialLinks = [
    { name: 'github', url: profile.github_url, icon: <FaGithub size={18} /> },
    { name: 'linkedin', url: profile.linkedin_url, icon: <FaLinkedin size={18} /> },
    { name: 'twitter', url: profile.twitter_url, icon: <FaTwitter size={18} /> }
  ].filter(link => link.url);
  
  // Handle messaging about a specific skill
  const handleMessageAboutSkill = (e, skill) => {
    e.preventDefault(); // Prevent navigating to profile
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/messages?contact=${profile.id}&subject=Skill: ${skill}`);
  };

  return (
    <motion.div
      className="bg-gray-800/70 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 shadow-xl h-full"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -5,
        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)'
      }}
    >
      <div className="p-5">
        <div className="flex items-start">
          {/* Profile image */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-purple-400/60">
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
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
            )}
          </div>
          
          {/* Profile info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">{profile.full_name}</h3>
              {profile.experience_level && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  profile.experience_level === 'Bilow' || profile.experience_level === 'Junior' ? 'bg-green-900/60 text-green-300' : 
                  profile.experience_level === 'Dhexe' || profile.experience_level === 'Mid-level' ? 'bg-blue-900/60 text-blue-300' : 
                  'bg-purple-900/60 text-purple-300'
                }`}>
                  {profile.experience_level}
                </span>
              )}
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
                  {profile.years_of_experience} <span className="text-purple-300">{profile.years_of_experience === 1 ? 'year' : 'years'}</span> of experience
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Skills */}
        {displaySkills.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((skill, index) => (
                <span 
                  key={index}
                  className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs group flex items-center"
                >
                  {skill}
                  <button
                    onClick={(e) => handleMessageAboutSkill(e, skill)}
                    className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    title={`Message about ${skill}`}
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
        
        {/* Specializations */}
        {specializationNames.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Specializations</h4>
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
        
        {/* Bio preview */}
        {profile.bio && (
          <div className="mt-4">
            <p className="text-gray-400 text-sm line-clamp-2">{profile.bio}</p>
          </div>
        )}
        
        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="mt-4 flex gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={`${link.name} profile`}
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2">
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
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard; 