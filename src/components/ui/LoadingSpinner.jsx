import React from 'react';
import { motion } from 'framer-motion';

const sizeVariants = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4'
};

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      className={`
        ${sizeVariants[size]}
        border-t-primary
        border-r-primary/30
        border-b-primary/10
        border-l-transparent
        rounded-full
        ${className}
      `}
    />
  );
};

export default LoadingSpinner; 