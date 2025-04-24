import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

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

const Select = forwardRef(({
  variant = 'outline',
  size = 'md',
  className = '',
  error,
  options = [],
  placeholder = 'Select an option',
  ...props
}, ref) => {
  return (
    <div className="relative">
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full
            appearance-none
            rounded-lg
            pr-10
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
            ${className}
          `}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Select.displayName = 'Select';

export default Select; 