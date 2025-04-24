import React from 'react';
import ProfileCard from './ProfileCard';
import { motion } from 'framer-motion';

const Home = () => {
  // Sample skills data
  const skills = [
    { name: 'React', level: 90 },
    { name: 'JavaScript', level: 85 },
    { name: 'TypeScript', level: 80 },
    { name: 'Node.js', level: 75 },
    { name: 'CSS', level: 85 },
    { name: 'HTML', level: 90 },
    { name: 'Git', level: 80 },
    { name: 'Framer Motion', level: 70 },
  ];

  // Sample profile data
  const profileData = {
    name: 'Alex Johnson',
    title: 'Frontend Developer',
    description: 'I build modern web applications with React and JavaScript. Passionate about creating intuitive user interfaces and smooth animations.',
    skills: skills,
    social: {
      github: 'https://github.com/alexjohnson',
      linkedin: 'https://linkedin.com/in/alexjohnson',
      twitter: 'https://twitter.com/alexjohnson'
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5 
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Developer Portfolio
        </motion.h1>
        
        <ProfileCard {...profileData} />
        
        <motion.div 
          className="mt-12 text-center text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>© 2023 Alex Johnson. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home; 