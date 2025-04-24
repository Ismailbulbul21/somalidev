import React, { forwardRef } from 'react';

const variants = {
  outline: 'border-2 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-transparent',
  filled: 'border-2 border-transparent bg-gray-100 dark:bg-gray-800 focus:bg-transparent dark:focus:bg-transparent focus:border-primary dark:focus:border-primary',
  flushed: 'border-b-2 border-gray-200 dark:border-gray-700 rounded-none focus:border-primary dark:focus:border-primary bg-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-4 py-3 text-lg'
};

const Input = forwardRef(({
  variant = 'outline',
  size = 'md',
  className = '',
  error,
  leftElement,
  rightElement,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {leftElement && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {leftElement}
        </span>
      )}
      
      <input
        ref={ref}
        className={`
          w-full
          rounded-lg
          outline-none
          transition-all
          duration-200
          placeholder:text-gray-400
          dark:placeholder:text-gray-500
          text-gray-900
          dark:text-gray-100
          disabled:opacity-60
          disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500' : ''}
          ${variants[variant]}
          ${sizes[size]}
          ${leftElement ? 'pl-10' : ''}
          ${rightElement ? 'pr-10' : ''}
          ${className}
        `}
        {...props}
      />

      {rightElement && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {rightElement}
        </span>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 