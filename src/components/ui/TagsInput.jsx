import React, { useState, useRef, useEffect } from 'react';

const TagsInput = ({ tags, setTags, placeholder, className }) => {
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Focus input when clicking on container
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
  };

  // Handle key presses for adding tags
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove the last tag when pressing backspace in an empty input
      removeTag(tags.length - 1);
    }
  };

  // Add a new tag
  const addTag = () => {
    const trimmedInput = input.trim().toLowerCase();
    
    // Skip if empty or already exists
    if (!trimmedInput || tags.includes(trimmedInput)) {
      setInput('');
      return;
    }
    
    // Max 10 tags
    if (tags.length >= 10) {
      return;
    }
    
    setTags([...tags, trimmedInput]);
    setInput('');
  };

  // Remove a tag by index
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Handle focus and blur
  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  // Effect to handle clicks outside of the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsActive(false);
        
        // Add tag if there's input when clicking outside
        if (input.trim()) {
          addTag();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [input]);

  return (
    <div 
      ref={containerRef}
      className={`flex flex-wrap items-center gap-2 min-h-[42px] p-2 rounded-md cursor-text ${
        isActive ? 'ring-1 ring-purple-500 border-purple-500' : 'border-gray-700'
      } ${className}`}
      onClick={handleContainerClick}
    >
      {/* Render tags */}
      {tags.map((tag, index) => (
        <div 
          key={index} 
          className="flex items-center bg-purple-600/30 text-purple-400 px-2 py-1 rounded-md text-sm"
        >
          <span>{tag}</span>
          <button
            type="button"
            className="ml-1.5 text-purple-400 hover:text-white"
            onClick={() => removeTag(index)}
          >
            &times;
          </button>
        </div>
      ))}
      
      {/* Input for new tags */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-grow bg-transparent text-white outline-none placeholder-gray-400 min-w-[120px] text-sm"
      />
      
      {/* Show max tags message if needed */}
      {tags.length >= 10 && (
        <div className="w-full mt-1 text-xs text-gray-400">
          Maximum of 10 tags reached
        </div>
      )}
    </div>
  );
};

export default TagsInput; 