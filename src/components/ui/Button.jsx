import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const variants = {
  primary: 'bg-primary hover:bg-primary/90 text-white',
  secondary: 'bg-secondary hover:bg-secondary/90 text-white',
  outline: 'border-2 border-primary hover:bg-primary/10 text-primary',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={`
        relative
        inline-flex
        items-center
        justify-center
        rounded-lg
        font-medium
        transition-colors
        duration-200
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} className="text-current" />
        </span>
      )}
      
      <span className={`flex items-center gap-2 ${isLoading ? 'invisible' : ''}`}>
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </span>
    </motion.button>
  );
};

export default Button; 