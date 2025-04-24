import React from 'react';
import { motion } from 'framer-motion';
import SkillBadge from './ui/SkillBadge';

const SkillList = ({ 
  skills = [], 
  onSkillClick = null,
  animated = true,
  title = null,
  colors = {},
  sizes = {},
  className = ''
}) => {
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // If no skills are provided, return null
  if (!skills || skills.length === 0) {
    return null;
  }
  
  // Handle skill click if provided
  const handleSkillClick = (skill) => {
    if (typeof onSkillClick === 'function') {
      onSkillClick(skill);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-200 mb-3">{title}</h3>
      )}
      
      <motion.div 
        className="flex flex-wrap gap-2"
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        {skills.map((skill, index) => {
          // Handle if skill is an object or a string
          const skillName = typeof skill === 'object' ? skill.name : skill;
          return (
            <SkillBadge
              key={`${skillName}-${index}`}
              skill={skillName}
              color={colors[skillName] || 'default'}
              size={sizes[skillName] || 'medium'}
              animated={animated}
              onClick={onSkillClick ? () => handleSkillClick(skillName) : undefined}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default SkillList; 