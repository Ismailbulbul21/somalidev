import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProfiles } from '../utils/supabaseClient.jsx';
import ProfileCard from '../components/ui/ProfileCard';
import { useAuth } from '../utils/AuthContext';

const Home = () => {
  const [featuredDevs, setFeaturedDevs] = useState([]);
  const [topRatedDevs, setTopRatedDevs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured developers
        const profilesData = await getProfiles([], {
          limit: 3
        });
        setFeaturedDevs(profilesData);

        // Fetch top rated developers
        const topRatedData = await getProfiles([], {
          sortBy: 'average_rating',
          sortOrder: 'desc',
          limit: 3
        });
        
        // Only include profiles with ratings
        const ratedProfiles = topRatedData.filter(profile => 
          profile.average_rating && profile.rating_count > 0
        );
        setTopRatedDevs(ratedProfiles);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Connect with Somali Tech Talent
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover skilled developers, showcase your work, and grow your network in the Somali tech community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/developers"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Browse Developers
              </Link>
              {!user && (
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
                >
                  Join as a Developer
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Rated Developers - Moved to appear first */}
      {topRatedDevs.length > 0 && (
        <section className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-bold">Top Rated Developers</h2>
                <Link
                  to="/developers"
                  className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topRatedDevs.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Developers - Moved to appear second */}
      {featuredDevs.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-bold">Featured Developers</h2>
                <Link
                  to="/developers"
                  className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredDevs.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-gray-800 rounded-lg my-8 mx-4">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to showcase your skills?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Create your developer profile, share your projects, and connect with opportunities in the tech industry.
              </p>
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md font-medium text-lg transition-colors"
              >
                Join SomaliDevs Today
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
