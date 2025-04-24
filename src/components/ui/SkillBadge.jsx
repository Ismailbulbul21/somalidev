import React from 'react';
import { motion } from 'framer-motion';

// Color variants for different skill categories
const colorVariants = {
  default: 'bg-gray-700/70 text-gray-100',
  frontend: 'bg-blue-600/40 text-blue-100',
  backend: 'bg-green-600/40 text-green-100',
  mobile: 'bg-orange-600/40 text-orange-100',
  database: 'bg-purple-600/40 text-purple-100',
  devops: 'bg-red-600/40 text-red-100',
  design: 'bg-pink-600/40 text-pink-100',
  aiml: 'bg-teal-600/40 text-teal-100',
  security: 'bg-yellow-600/40 text-yellow-100',
  language: 'bg-indigo-600/40 text-indigo-100',
  tool: 'bg-cyan-600/40 text-cyan-100',
  learning: 'bg-amber-600/40 text-amber-100 border border-dashed border-amber-400',
};

// Map common skills to their categories
const skillCategoryMap = {
  // Frontend
  'React': 'frontend',
  'Angular': 'frontend',
  'Vue.js': 'frontend',
  'HTML': 'frontend',
  'CSS': 'frontend',
  'JavaScript': 'language',
  'TypeScript': 'language',
  'Tailwind CSS': 'frontend',
  'Bootstrap': 'frontend',
  'NextJS': 'frontend',
  'Svelte': 'frontend',
  'SCSS': 'frontend',
  
  // Backend
  'Node.js': 'backend',
  'Express': 'backend',
  'Django': 'backend',
  'Flask': 'backend',
  'Spring Boot': 'backend',
  'Laravel': 'backend',
  'ASP.NET': 'backend',
  'Ruby on Rails': 'backend',
  'FastAPI': 'backend',
  'GraphQL': 'backend',
  'REST API': 'backend',
  
  // Databases
  'MySQL': 'database',
  'PostgreSQL': 'database',
  'MongoDB': 'database',
  'Redis': 'database',
  'Firebase': 'database',
  'Supabase': 'database',
  'DynamoDB': 'database',
  'Elasticsearch': 'database',
  'SQLite': 'database',
  'Cassandra': 'database',
  
  // Mobile
  'React Native': 'mobile',
  'Flutter': 'mobile',
  'Swift': 'mobile',
  'Kotlin': 'mobile',
  'iOS': 'mobile',
  'Android': 'mobile',
  'Ionic': 'mobile',
  'Xamarin': 'mobile',
  
  // AI/ML
  'Machine Learning': 'aiml',
  'Deep Learning': 'aiml',
  'TensorFlow': 'aiml',
  'PyTorch': 'aiml',
  'Computer Vision': 'aiml',
  'NLP': 'aiml',
  'Data Science': 'aiml',
  'AI': 'aiml',
  
  // DevOps
  'Docker': 'devops',
  'Kubernetes': 'devops',
  'AWS': 'devops',
  'Azure': 'devops',
  'GCP': 'devops',
  'Jenkins': 'devops',
  'GitHub Actions': 'devops',
  'CI/CD': 'devops',
  'Terraform': 'devops',
  'Ansible': 'devops',
  
  // Design
  'UI/UX': 'design',
  'Figma': 'design',
  'Sketch': 'design',
  'Adobe XD': 'design',
  'Photoshop': 'design',
  'Illustrator': 'design',
  
  // Security
  'Cybersecurity': 'security',
  'Penetration Testing': 'security',
  'Ethical Hacking': 'security',
  'Security Audit': 'security',
  'Cryptography': 'security',
  
  // Languages
  'Python': 'language',
  'Java': 'language',
  'C#': 'language',
  'C++': 'language',
  'Go': 'language',
  'Rust': 'language',
  'Ruby': 'language',
  'PHP': 'language',
  'Scala': 'language',
  'Perl': 'language',
  
  // Tools
  'Git': 'tool',
  'VS Code': 'tool',
  'Jira': 'tool',
  'Postman': 'tool',
  'Webpack': 'tool',
  'Babel': 'tool',
  'npm': 'tool',
  'yarn': 'tool',
};

const SkillBadge = ({ 
  skill, 
  color = 'default',
  size = 'medium',
  animated = true,
  onClick = null
}) => {
  // Determine if the badge is clickable
  const isClickable = typeof onClick === 'function';
  
  // Define color variants
  const colorVariants = {
    default: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
    primary: 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/60',
    secondary: 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/60',
    success: 'bg-green-900/50 text-green-300 hover:bg-green-800/60',
    danger: 'bg-red-900/50 text-red-300 hover:bg-red-800/60',
    warning: 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-800/60',
    info: 'bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/60'
  };
  
  // Define size variants
  const sizeVariants = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5'
  };
  
  // Animation variants
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    tap: { scale: 0.95 }
  };
  
  // Determine component type based on animation flag
  const Badge = animated ? motion.span : 'span';
  
  return (
    <Badge
      className={`
        inline-flex items-center rounded-full font-medium
        ${colorVariants[color] || colorVariants.default}
        ${sizeVariants[size] || sizeVariants.medium}
        ${isClickable ? 'cursor-pointer' : ''}
        transition-colors
      `}
      onClick={isClickable ? onClick : undefined}
      variants={animated ? badgeVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
      whileTap={animated && isClickable ? 'tap' : undefined}
      layout={animated}
    >
      {skill}
    </Badge>
  );
};

export default SkillBadge; 