import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// Category icons mapping
const categoryIcons = {
  'Mobile Development': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  'Web Development': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  'Machine Learning': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'UI/UX Design': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  'Game Development': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'Data Science': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  'Cybersecurity': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

// Default icon for categories without a specific icon
const defaultIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

// Background color variants for categories
const bgColorVariants = [
  'from-purple-600/50 to-blue-600/50',
  'from-blue-600/50 to-cyan-500/50',
  'from-green-600/50 to-emerald-500/50',
  'from-orange-600/50 to-amber-500/50',
  'from-pink-600/50 to-rose-500/50',
  'from-violet-600/50 to-indigo-500/50',
  'from-red-600/50 to-orange-500/50',
];

const CategoryCard = ({ category, index }) => {
  // Validation - make sure we have the required properties
  if (!category || !category.name) {
    return (
      <div className="bg-red-900/30 p-6 rounded-lg border border-red-700">
        <p className="text-red-400">Invalid category data</p>
      </div>
    );
  }
  
  // Ensure index is within range of colors
  const colorIndex = index % bgColorVariants.length;
  const bgGradient = bgColorVariants[colorIndex];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)'
      }}
    >
      <Link 
        to={`/developers?specialization=${category.id}`}
        className={`block bg-gradient-to-br ${bgGradient} backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 shadow-lg p-6 h-full`}
      >
        <div className="text-white">
          {/* Icon */}
          <div className="mb-4">
            {categoryIcons[category.name] || defaultIcon}
          </div>
          
          {/* Category name */}
          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
          
          {/* Description */}
          {category.description && (
            <p className="text-gray-100/80 text-sm">{category.description}</p>
          )}
          
          {/* Explore link */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm font-medium">Find Developers</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired,
  index: PropTypes.number
};

export default CategoryCard;
