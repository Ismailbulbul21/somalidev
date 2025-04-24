import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../utils/AuthContext';
import { useMessages } from '../../utils/MessagesContext';
import { getProfile } from '../../utils/supabaseClient.jsx';
import NotificationBadge from '../ui/NotificationBadge';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const MainLayout = () => {
  const { user, signOut } = useAuth();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Handle scroll effect for parallax background
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fetch user profile data if user is logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }
      
      try {
        setLoading(true);
        // Get full profile data from the database
        const profileData = await getProfile(user.id);
        
        if (profileData) {
          setUserProfile(profileData);
        } else {
          // Fallback to user metadata if profile not found
          const { user_metadata } = user;
          setUserProfile({
            full_name: user_metadata?.full_name || user_metadata?.name || 'User',
            avatar_url: user_metadata?.avatar_url || user_metadata?.picture || null,
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to user metadata on error
        const { user_metadata } = user;
        setUserProfile({
          full_name: user_metadata?.full_name || user_metadata?.name || 'User',
          avatar_url: user_metadata?.avatar_url || user_metadata?.picture || null,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Developers', path: '/developers' },
  ];
  
  // Auth links
  const authLinks = user ? [
    { name: 'Profile', path: '/profile' },
    { name: 'Messages', path: '/messages', showBadge: true },
    { name: 'Dashboard', path: '/dashboard' },
  ] : [
    { name: 'Sign In', path: '/signin' },
    { name: 'Sign Up', path: '/signup' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Animated background */}
      <div 
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center opacity-30" 
        style={{ 
          backgroundImage: 'url("/bg-ghibli.jpg")', 
          transform: `translateY(${scrollY * 0.2}px)` 
        }}
      />
      
      {/* Floating particles effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/20"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        ))}
      </div>
      
      {/* Navigation */}
      <header className="relative z-10 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <svg
                className="h-10 w-10 text-purple-400" 
                viewBox="0 0 24 24" 
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-400">
                SomaliDevs
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-purple-600/30 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="border-l border-gray-700 h-6 mx-2" />
              
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Auth Links */}
                  {authLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                        location.pathname === link.path
                          ? 'bg-purple-600/30 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {link.name}
                      {link.showBadge && <NotificationBadge count={unreadCount} />}
                    </Link>
                  ))}
                  
                  {/* User Profile Avatar */}
                  <Link 
                    to="/profile" 
                    className="transition-all duration-200 hover:ring-2 hover:ring-purple-500 flex items-center"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-400/60">
                      {userProfile?.avatar_url ? (
                        <img 
                          src={userProfile.avatar_url}
                          alt={userProfile.full_name || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-bold">
                          {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  {/* Sign Out Button */}
                  <button
                    onClick={signOut}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                /* Sign In/Sign Up Links for non-authenticated users */
                authLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-purple-600/30 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))
              )}
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile menu */}
          <motion.div
            className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
            initial="hidden"
            animate={isMenuOpen ? "visible" : "hidden"}
            variants={fadeIn}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user && (
                <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-400/60">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-bold">
                        {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{userProfile?.full_name || user?.email}</span>
                    <span className="text-xs text-gray-400">Logged in</span>
                  </div>
                </div>
              )}
              
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-purple-600/30 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {authLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium relative ${
                    location.pathname === link.path
                      ? 'bg-purple-600/30 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                  {link.showBadge && <NotificationBadge count={unreadCount} />}
                </Link>
              ))}
              
              {user && (
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </header>
      
      {/* Main content */}
      <motion.main 
        className="flex-grow container mx-auto px-4 py-8 relative z-10"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Outlet />
      </motion.main>
      
      {/* Footer */}
      <footer className="relative z-10 bg-gray-800/50 backdrop-blur-lg border-t border-gray-700 text-gray-400">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-400">
                SomaliDevs
              </span>
              <p className="text-sm mt-1">Connecting Somali tech talent with opportunities</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SomaliDevs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 