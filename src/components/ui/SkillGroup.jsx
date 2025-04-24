import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SkillGroup = ({ 
  title, 
  skills = [], 
  learningSkills = [], 
  animated = true, 
  profileId = null, 
  showMessageIcons = false 
}) => {
  const navigate = useNavigate();
  
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleMessageClick = (skill) => {
    if (profileId) {
      navigate(`/messages?contact=${profileId}&subject=Skill: ${skill}`);
    }
  };

  const WrapperComponent = animated ? motion.div : 'div';
  const SkillComponent = animated ? motion.span : 'span';
  const LearningComponent = animated ? motion.span : 'span';

  return (
    <WrapperComponent
      className="mb-6"
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      <h3 className="text-xl font-medium mb-3 text-gray-200">{title}</h3>
      
      {/* Regular Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill, index) => (
            <SkillComponent
              key={`${skill}-${index}`}
              variants={animated ? itemVariants : undefined}
              className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm border border-purple-800/50 flex items-center group"
            >
              {skill}
              
              {showMessageIcons && profileId && (
                <button 
                  onClick={() => handleMessageClick(skill)}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                  title={`Message about ${skill}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </button>
              )}
            </SkillComponent>
          ))}
        </div>
      )}
      
      {/* Learning Skills */}
      {learningSkills.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Currently Learning:</p>
          <div className="flex flex-wrap gap-2">
            {learningSkills.map((skill, index) => (
              <LearningComponent
                key={`learning-${skill}-${index}`}
                variants={animated ? itemVariants : undefined}
                className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-800/50 flex items-center group"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {skill}
                
                {showMessageIcons && profileId && (
                  <button 
                    onClick={() => handleMessageClick(skill)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                    title={`Message about ${skill}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                )}
              </LearningComponent>
            ))}
          </div>
        </div>
      )}
    </WrapperComponent>
  );
};

export default SkillGroup; 