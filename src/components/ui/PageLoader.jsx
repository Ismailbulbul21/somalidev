import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center p-8 rounded-lg bg-white/10">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg font-medium text-white">{message}</p>
      </div>
    </motion.div>
  );
};

export default PageLoader; 