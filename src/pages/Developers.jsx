import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfiles, getSkills, getSpecializations } from '../utils/supabaseClient.jsx';
import ProfileCard from '../components/ui/ProfileCard';
import { Link } from 'react-router-dom';
import { FiFilter, FiPlus, FiX, FiChevronDown, FiChevronUp, FiSearch, FiClock } from 'react-icons/fi';

const Developers = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [minYearsExperience, setMinYearsExperience] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all profiles
        const profilesData = await getProfiles();
        setProfiles(profilesData);
        setFilteredProfiles(profilesData);
        setTotalProfiles(profilesData.length);
        
        // Fetch skills and organize by category
        const skillsData = await getSkills();
        
        // Group skills by category
        const groupedSkills = skillsData.reduce((acc, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {});
        
        setSkillsByCategory(groupedSkills);
        
        // Initialize expanded state for each category
        const initialExpandedState = {};
        Object.keys(groupedSkills).forEach(category => {
          initialExpandedState[category] = false;
        });
        setExpandedCategories(initialExpandedState);
        
        // Fetch specializations for filter
        const specializationsData = await getSpecializations();
        setSpecializations(specializationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when search term, skills, specialization, experience level, or rating changes
  useEffect(() => {
    let results = [...profiles];
    
    // Filter by search term (name or title)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(profile => 
        profile.full_name.toLowerCase().includes(term) || 
        (profile.title && profile.title.toLowerCase().includes(term))
      );
    }
    
    // Filter by selected skills
    if (selectedSkills.length > 0) {
      results = results.filter(profile => 
        profile.profile_skills && profile.profile_skills.some(ps => 
          selectedSkills.includes(ps.skills.id)
        )
      );
    }
    
    // Filter by specialization
    if (selectedSpecialization) {
      results = results.filter(profile => 
        profile.specializations && 
        profile.specializations.includes(selectedSpecialization)
      );
    }
    
    // Filter by experience level
    if (experienceLevel) {
      results = results.filter(profile => 
        profile.experience_level === experienceLevel
      );
    }
    
    // Filter by minimum years of experience
    if (minYearsExperience) {
      const minYears = parseInt(minYearsExperience);
      results = results.filter(profile => 
        profile.years_of_experience && profile.years_of_experience >= minYears
      );
    }
    
    // Filter by minimum rating
    if (minRating) {
      const minRatingValue = parseInt(minRating);
      results = results.filter(profile => 
        profile.average_rating && profile.average_rating >= minRatingValue
      );
    }
    
    // Sort by rating (highest first) for all results
    results.sort((a, b) => {
      // Handle cases where rating might be missing
      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      return ratingB - ratingA;
    });
    
    setFilteredProfiles(results);
  }, [searchTerm, selectedSkills, selectedSpecialization, experienceLevel, minYearsExperience, minRating, profiles]);

  // Toggle skill selection
  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
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

  const handleReset = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedSpecialization('');
    setExperienceLevel('');
    setMinYearsExperience('');
    setMinRating('');
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">Explore Developers</h1>
              <p className="text-gray-300 text-lg max-w-3xl mt-2">
                Discover skilled developers in the Somali tech community across various specializations.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm flex items-center transition-colors"
              >
                {showFilters ? <FiX className="mr-2" /> : <FiFilter className="mr-2" />}
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <Link 
                to="/profile/edit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md text-sm flex items-center transition-colors"
              >
                <FiPlus className="mr-2" />
                Add Specialization
              </Link>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {specializations.map(specialization => (
              <div 
                key={specialization.id}
                onClick={() => setSelectedSpecialization(
                  selectedSpecialization === specialization.id ? '' : specialization.id
                )}
                className={`cursor-pointer px-3 py-1.5 rounded-full flex items-center border transition-colors ${
                  selectedSpecialization === specialization.id
                    ? 'bg-purple-700/70 border-purple-500 text-white'
                    : 'bg-gray-800/70 backdrop-blur-sm border-gray-700 hover:bg-gray-700/70'
                }`}
              >
                <span className="text-sm font-medium text-gray-200">{specialization.name}</span>
                <span className="ml-2 text-xs text-gray-400 hidden sm:inline">{getSpecializationCount(profiles, specialization.id)} developers</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* Left Column: Search and Filters */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Search input */}
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-2">
                      Search by name or title
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="e.g. John Doe, Frontend Developer"
                        className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Experience level filter */}
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-400 mb-2">
                      Experience Level
                    </label>
                    <select
                      id="experience"
                      value={experienceLevel}
                      onChange={e => setExperienceLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Any Level</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Bilow">Bilow</option>
                      <option value="Dhexe">Dhexe</option>
                      <option value="Sare">Sare</option>
                    </select>
                  </div>
                  
                  {/* Minimum rating filter */}
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-400 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      id="rating"
                      value={minRating}
                      onChange={e => setMinRating(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Any Rating</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Star</option>
                    </select>
                  </div>
                  
                  {/* Years of experience filter */}
                  <div>
                    <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-400 mb-2">
                      Minimum Years of Experience
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <select
                        id="yearsExperience"
                        value={minYearsExperience}
                        onChange={e => setMinYearsExperience(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Any experience</option>
                        <option value="1">At least 1 year</option>
                        <option value="2">At least 2 years</option>
                        <option value="3">At least 3 years</option>
                        <option value="5">At least 5 years</option>
                        <option value="7">At least 7 years</option>
                        <option value="10">At least 10 years</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Specialization filter */}
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-400 mb-2">
                      Specialization
                    </label>
                    <select
                      id="specialization"
                      value={selectedSpecialization}
                      onChange={e => setSelectedSpecialization(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(specialization => (
                        <option key={specialization.id} value={specialization.id}>
                          {specialization.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Reset filters button */}
                  {(searchTerm || selectedSkills.length > 0 || selectedSpecialization || experienceLevel || minYearsExperience || minRating) && (
                    <button
                      onClick={handleReset}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm flex items-center justify-center transition-colors"
                    >
                      <FiX className="mr-1.5" />
                      Reset All Filters
                    </button>
                  )}
                </div>
                
                {/* Right Column: Skills by Category */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-medium text-lg text-gray-200 mb-3">Filter by Skills</h3>
                  
                  {Object.keys(skillsByCategory).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(skillsByCategory).map(([category, skills]) => (
                        <div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => toggleCategory(category)}
                            className="w-full flex justify-between items-center p-3 bg-gray-800 hover:bg-gray-700 transition-colors text-left"
                          >
                            <span className="font-medium">{category}</span>
                            {expandedCategories[category] ? (
                              <FiChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FiChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          
                          <AnimatePresence>
                            {expandedCategories[category] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-3 bg-gray-800/50"
                              >
                                <div className="flex flex-wrap gap-2">
                                  {skills.map(skill => (
                                    <button
                                      key={skill.id}
                                      onClick={() => toggleSkill(skill.id)}
                                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        selectedSkills.includes(skill.id)
                                          ? 'bg-purple-600 text-white'
                                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      }`}
                                    >
                                      {skill.name}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 bg-gray-800/40 rounded-lg p-4">
                      No skills available for filtering
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Filters Summary */}
        {(selectedSkills.length > 0 || selectedSpecialization || experienceLevel || minYearsExperience || minRating) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap gap-2 items-center"
          >
            <span className="text-gray-400 text-sm">Active filters:</span>
            
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skillId => {
                  const skill = Object.values(skillsByCategory)
                    .flat()
                    .find(s => s.id === skillId);
                  
                  return skill ? (
                    <div 
                      key={skill.id}
                      className="bg-purple-900/40 text-purple-200 border border-purple-700/50 pl-3 pr-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {skill.name}
                      <button 
                        onClick={() => toggleSkill(skill.id)}
                        className="ml-2 text-purple-300 hover:text-white"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
            
            {selectedSpecialization && (
              <div className="bg-blue-900/40 text-blue-200 border border-blue-700/50 pl-3 pr-2 py-1 rounded-md text-sm flex items-center">
                {specializations.find(s => s.id === selectedSpecialization)?.name}
                <button 
                  onClick={() => setSelectedSpecialization('')}
                  className="ml-2 text-blue-300 hover:text-white"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {experienceLevel && (
              <div className="bg-green-900/40 text-green-200 border border-green-700/50 pl-3 pr-2 py-1 rounded-md text-sm flex items-center">
                {experienceLevel} Developer
                <button 
                  onClick={() => setExperienceLevel('')}
                  className="ml-2 text-green-300 hover:text-white"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {minYearsExperience && (
              <div className="bg-amber-900/40 text-amber-200 border border-amber-700/50 pl-3 pr-2 py-1 rounded-md text-sm flex items-center">
                {minYearsExperience}+ years of experience
                <button 
                  onClick={() => setMinYearsExperience('')}
                  className="ml-2 text-amber-300 hover:text-white"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {minRating && (
              <div className="bg-teal-900/40 text-teal-200 border border-teal-700/50 pl-3 pr-2 py-1 rounded-md text-sm flex items-center">
                {minRating}+ stars
                <button 
                  onClick={() => setMinRating('')}
                  className="ml-2 text-teal-300 hover:text-white"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Results Stats */}
        <motion.div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-3 border-b border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold">
            {filteredProfiles.length} {filteredProfiles.length === 1 ? 'Developer' : 'Developers'} Found
          </h2>
          
          {filteredProfiles.length < totalProfiles && (
            <div className="text-gray-400 text-sm mt-2 sm:mt-0">
              {filteredProfiles.length} of {totalProfiles} total developers
            </div>
          )}
        </motion.div>

        {/* Developers Grid */}
        <section>
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
                  <ProfileCard 
                    profile={profile} 
                    showYearsExperience={true}
                  />
                </motion.div>
              ))}
              
              {filteredProfiles.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <motion.div 
                    className="bg-gray-800/50 rounded-lg p-8 border border-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">No developers found</h3>
                    <p className="text-gray-400 mb-4">
                      {selectedSpecialization ? (
                        <>
                          We couldn't find any developers with the "{specializations.find(s => s.id === selectedSpecialization)?.name}" specialization.
                          <br className="hidden md:block" />
                          Be the first to add this specialization to your profile!
                        </>
                      ) : minYearsExperience ? (
                        `We couldn't find any developers with ${minYearsExperience}+ years of experience matching your criteria.`
                      ) : (
                        'We couldn\'t find any developers matching your current filters.'
                      )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
                      >
                        Reset All Filters
                      </button>
                      
                      {selectedSpecialization && (
                        <Link
                          to="/profile/edit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors flex items-center justify-center"
                        >
                          <FiPlus className="mr-1.5" />
                          Add to Your Profile
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

// Helper function to count how many developers have a specific specialization
function getSpecializationCount(profiles, specializationId) {
  return profiles.filter(profile => 
    profile.specializations && profile.specializations.includes(specializationId)
  ).length;
}

export default Developers;
