import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProjectCard = ({ 
  project, 
  isOwner = false, 
  onEdit = null, 
  onDelete = null,
  animated = true 
}) => {
  const { 
    id, 
    title, 
    description, 
    skills = [], 
    image_url, 
    github_url, 
    live_url, 
    created_at 
  } = project;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short'
    }).format(date);
  };

  const CardComponent = animated ? motion.div : 'div';

  return (
    <CardComponent
      className="border border-gray-800 bg-gray-900/50 rounded-lg overflow-hidden flex flex-col hover:border-purple-700/50 transition-colors duration-300"
      variants={animated ? cardVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      {/* Project Image */}
      {image_url && (
        <div className="h-40 overflow-hidden">
          <img 
            src={image_url} 
            alt={title} 
            className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      <div className="p-4 flex flex-col flex-grow">
        {/* Project Title */}
        <h3 className="text-xl font-medium text-white mb-2">{title}</h3>

        {/* Date */}
        <div className="text-sm text-gray-400 mb-3">
          {formatDate(created_at)}
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-4 flex-grow">
          {description && description.length > 120 
            ? `${description.substring(0, 120)}...` 
            : description}
        </p>

        {/* Skills Used */}
        {skills && skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 5).map((skill, index) => (
                <span 
                  key={`${skill}-${index}`}
                  className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs">
                  +{skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Links and Actions */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex space-x-3">
            {github_url && (
              <a 
                href={github_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="View GitHub repository"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
            {live_url && (
              <a 
                href={live_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="View live project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            )}
          </div>

          {isOwner && (
            <div className="flex space-x-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(id)} 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="Edit project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(id)} 
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  aria-label="Delete project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </CardComponent>
  );
};

export default ProjectCard; 