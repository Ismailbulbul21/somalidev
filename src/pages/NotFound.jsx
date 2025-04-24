import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12 text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-9xl font-bold text-purple-500">404</h1>
        <div className="h-2 w-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto my-6"></div>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md font-medium transition-colors inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </motion.div>
      
      {/* Background particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-500/10"
            style={{
              width: Math.random() * 30 + 10,
              height: Math.random() * 30 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotFound; 