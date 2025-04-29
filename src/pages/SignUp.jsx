import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';

const SignUp = () => {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'developer', // Always developer
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('All fields are required');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }

      // Create user metadata - always as developer
      const userData = {
        full_name: formData.fullName,
        account_type: 'developer', // Always set to developer
      };

      // Register user
      await signUp(formData.email, formData.password, userData);
      
      // Show success message instead of immediately navigating
      setSuccess(true);
      
      // After 5 seconds, navigate to home page
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 flex justify-center items-center">
      <motion.div
        className="w-full max-w-lg bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg border border-gray-700 shadow-xl my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {success ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-green-800/50 text-green-200 p-6 rounded-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Thank you for signing up!</h2>
              <p className="mb-4">We've sent a confirmation link to:</p>
              <p className="font-bold text-lg mb-4">{formData.email}</p>
              <p className="mb-2">Please check your email and click the confirmation link to activate your account.</p>
              <p className="text-sm">If you don't see it in your inbox, please check your spam folder.</p>
            </div>
            <p className="text-gray-400 mt-4">
              You will be redirected to the home page in a few seconds...
            </p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Create Your Account</h1>
              <p className="text-gray-400 mt-2">Join the Somali tech community today</p>
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
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-300 mb-2 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-300 mb-2 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">Must be at least 6 characters</p>
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-300 mb-2 font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Account type section removed - now automatically set to developer */}

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md font-medium transition-colors"
              >
                {isSubmitting || loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/signin" className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SignUp; 