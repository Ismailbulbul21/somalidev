import React from 'react';
import { motion } from 'framer-motion';

const Companies = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Companies
          </h1>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            This feature is coming soon! We're working on bringing you a comprehensive list of tech companies 
            and their job opportunities.
          </p>

          {/* Coming Soon Banner */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <svg 
                className="w-16 h-16 text-purple-500 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-gray-400 text-center">
                We're building a platform where companies can showcase their culture, 
                tech stack, and job opportunities. Stay tuned!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Companies; 