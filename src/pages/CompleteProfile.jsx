import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient.js';

const CompleteProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // Set account type to 'developer' always
  const accountType = 'developer';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Redirect if user is not logged in
    if (!loading && !user) {
      navigate('/signin');
    }
    
    // Redirect if user already has an account type
    if (user?.user_metadata?.account_type) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Update the user metadata with developer account type
      const { error } = await supabase.auth.updateUser({
        data: { account_type: 'developer' }
      });
      
      if (error) throw error;
      
      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Error updating account type:', error);
      setError('Failed to update account type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="py-12 flex justify-center items-center min-h-[calc(100vh-16rem)]">
      <motion.div
        className="w-full max-w-md bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg border border-gray-700 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to SomaliDevs</h1>
          <p className="text-gray-400 mt-2">Complete your developer profile to continue</p>
        </div>

        {error && (
          <motion.div
            className="bg-red-900/50 text-red-200 p-3 rounded-md mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 text-center">
            <p className="text-gray-300 mb-4">
              You're joining as a <span className="font-bold text-purple-400">Developer</span>
            </p>
            <p className="text-gray-400 text-sm">
              You'll be able to showcase your skills, find opportunities, and connect with other developers.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md font-medium transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CompleteProfile; 