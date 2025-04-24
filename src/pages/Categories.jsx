import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSpecializations } from '../utils/supabaseClient.js';
import CategoryCard from '../components/ui/CategoryCard';

const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setLoading(true);
        const data = await getSpecializations();
        setSpecializations(data || []);
      } catch (err) {
        console.error('Error fetching specializations:', err);
        setError('Failed to load specializations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializations();
  }, []);

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
          <h1 className="text-4xl font-bold mb-4">Tech Specializations</h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Explore different fields in technology and find developers with expertise in each area.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : specializations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No specializations found.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {specializations.map((specialization, index) => (
              <motion.div key={specialization.id} variants={itemVariants}>
                <CategoryCard category={specialization} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Categories; 
 
 
 