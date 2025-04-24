import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProfiles, getSkills } from '../utils/supabaseClient.js';
import ProfileCard from '../components/ui/ProfileCard';
import SkillBadge from '../components/ui/SkillBadge';

const CategoryDetails = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filteredProfiles, setFilteredProfiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!categoryName) {
          navigate('/categories');
          return;
        }

        setLoading(true);
        
        // Fetch skills by category
        const skillsData = await getSkills(categoryName);
        setSkills(skillsData);
        
        // Fetch profiles by category
        const profilesData = await getProfiles(categoryName);
        setProfiles(profilesData);
        setFilteredProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName, navigate]);

  // Filter profiles by selected skill
  useEffect(() => {
    if (!selectedSkill) {
      setFilteredProfiles(profiles);
      return;
    }

    const filtered = profiles.filter(profile => {
      return profile.profile_skills.some(
        ps => ps.skills.name === selectedSkill
      );
    });
    
    setFilteredProfiles(filtered);
  }, [selectedSkill, profiles]);

  const handleSkillClick = (skill) => {
    if (selectedSkill === skill) {
      setSelectedSkill(null); // Toggle off if already selected
    } else {
      setSelectedSkill(skill);
    }
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

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Explore developers with expertise in {categoryName} and related technologies.
          </p>
        </motion.div>

        {/* Skills Filter Section */}
        {skills.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-medium mb-4">Filter by Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillBadge
                  key={skill.id}
                  skill={skill.name}
                  onClick={() => handleSkillClick(skill.name)}
                  animated={true}
                />
              ))}
            </div>
            {selectedSkill && (
              <div className="mt-4 flex items-center">
                <span className="text-gray-400 mr-2">Active filter:</span>
                <span className="bg-purple-600/30 text-purple-200 py-1 px-2 rounded-md text-sm flex items-center">
                  {selectedSkill}
                  <button
                    onClick={() => setSelectedSkill(null)}
                    className="ml-2 text-purple-300 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Developers Section */}
        <section>
          <motion.h2
            className="text-2xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Developers
            {selectedSkill ? ` with ${selectedSkill} expertise` : ` in ${categoryName}`}
            {filteredProfiles.length > 0 && ` (${filteredProfiles.length})`}
          </motion.h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProfiles.map((profile) => (
                <motion.div key={profile.id} variants={itemVariants}>
                  <ProfileCard profile={profile} />
                </motion.div>
              ))}
              
              {filteredProfiles.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <motion.p 
                    className="text-gray-400 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {selectedSkill 
                      ? `No developers found with ${selectedSkill} expertise. Try selecting a different skill.`
                      : `No developers found in ${categoryName} category.`
                    }
                  </motion.p>
                </div>
              )}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryDetails; 