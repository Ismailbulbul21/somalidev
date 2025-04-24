import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';

const SignIn = () => {
  const { signIn, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for auth callback errors
    const callbackError = searchParams.get('error');
    if (callbackError === 'auth-callback-failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="py-12 flex justify-center items-center min-h-[calc(100vh-16rem)]">
      <motion.div
        className="w-full max-w-md bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg border border-gray-700 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to your SomaliDevs account</p>
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
            <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="block text-gray-300 font-medium">
                Password
              </label>
              {/* Implement this feature later */}
              <Link to="#" className="text-purple-400 hover:text-purple-300 text-sm">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

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
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/60 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-md hover:bg-gray-700/50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn; 