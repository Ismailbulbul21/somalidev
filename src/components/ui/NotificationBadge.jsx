import React from 'react';
import { motion } from 'framer-motion';

const NotificationBadge = ({ count }) => {
  // Don't render if count is 0
  if (!count || count <= 0) return null;

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1"
      title={count === 1 
        ? "1 unread conversation" 
        : `${count} unread conversations`}
    >
      {count > 99 ? '99+' : count}
    </motion.div>
  );
};

export default NotificationBadge; 