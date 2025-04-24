import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { FaSave } from 'react-icons/fa';
import { createSpecialization } from '../../utils/supabaseClient.jsx';

const NewSpecializationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Magaca xirfadda waa qasab';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Magaca xirfadda waa inuu ka badan yahay 2 xaraf';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      const { data, error } = await createSpecialization({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon.trim() || null
      });
      
      if (error) throw error;
      
      if (onSuccess && data) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Error creating specialization:', error);
      setErrors(prev => ({ 
        ...prev, 
        form: 'Khalad ayaa dhacay markii la abuurayay xirfadda. Fadlan dib u isku day.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { delay: 0.1 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onCancel}
    >
      <motion.div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-5"
        variants={modalVariants}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Abuur Xirfad Cusub</h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {errors.form && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-400">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Magaca Xirfadda <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-gray-700 border ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                } rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Gali magaca xirfadda"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Faahfaahinta (ikhtiyaari)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                placeholder="Sharaxaad kooban"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-1">
                Astaanta (ikhtiyaari)
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="fa-code"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-400">
                Magaca astaanta Font Awesome (tusaale: fa-code)
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Ka noqo
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Waa la keydiyaa...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Keydi
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewSpecializationForm; 