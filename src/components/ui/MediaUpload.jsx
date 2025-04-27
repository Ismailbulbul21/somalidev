import React, { useRef } from 'react';
import { FiImage, FiX, FiUpload } from 'react-icons/fi';

const MediaUpload = ({ 
  mediaFile, 
  mediaPreview, 
  onFileSelect, 
  onRemove 
}) => {
  const fileInputRef = useRef(null);
  
  // Handle media file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File is too large (max 5MB)');
      return;
    }
    
    if (onFileSelect) {
      onFileSelect(file);
    }
  };
  
  // Reset media upload
  const handleResetMedia = () => {
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      {/* Media Preview */}
      {mediaPreview ? (
        <div className="relative aspect-video rounded-md overflow-hidden bg-gray-800 border border-gray-700 mb-6">
          <img 
            src={mediaPreview} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleResetMedia}
            className="absolute top-2 right-2 bg-gray-900/80 text-white p-1 rounded-full hover:bg-red-600/80 transition-colors"
            aria-label="Remove image"
          >
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-700 rounded-md p-6 text-center hover:border-purple-500 transition-colors cursor-pointer"
        >
          <div className="flex flex-col items-center">
            <FiUpload className="text-gray-400 mb-2" size={24} />
            <p className="text-gray-400 mb-2">Click to upload an image</p>
            <p className="text-xs text-gray-500">JPEG, PNG, GIF, WEBP (max 5MB)</p>
          </div>
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default MediaUpload; 