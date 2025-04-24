import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiPlus, FiEdit, FiX, FiSearch } from 'react-icons/fi';
import { getSpecializations } from '../../utils/supabaseClient.js';
import NewSpecializationForm from './NewSpecializationForm';

const SpecializationManager = ({ 
  selectedIds = [], 
  onChange,
  allowEdit = true 
}) => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecializations, setFilteredSpecializations] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  // Fetch all available specializations
  useEffect(() => {
    fetchSpecializations();
  }, []);

  // Log when selectedIds change
  useEffect(() => {
    console.log("SpecializationManager: selectedIds updated:", selectedIds);
  }, [selectedIds]);

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      const data = await getSpecializations();
      console.log("SpecializationManager: fetched specializations:", data);
      setSpecializations(data || []);
      setFilteredSpecializations(data || []);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter specializations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSpecializations(specializations);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = specializations.filter(spec => 
      spec.name.toLowerCase().includes(term) || 
      (spec.description && spec.description.toLowerCase().includes(term))
    );
    
    setFilteredSpecializations(filtered);
  }, [searchTerm, specializations]);

  // Get selected specializations
  const getSelectedSpecializations = () => {
    const selected = specializations.filter(spec => selectedIds.includes(spec.id));
    console.log("SpecializationManager: current selected specializations:", selected);
    return selected;
  };

  // Handle specialization selection
  const handleSelect = (specializationId, e) => {
    if (!allowEdit) return;
    
    // Prevent the click from propagating to parent elements
    if (e) {
      e.stopPropagation();
    }
    
    console.log("SpecializationManager: toggling specialization:", specializationId);
    console.log("SpecializationManager: current selectedIds:", selectedIds);
    
    let newSelected;
    if (selectedIds.includes(specializationId)) {
      newSelected = selectedIds.filter(id => id !== specializationId);
    } else {
      newSelected = [...selectedIds, specializationId];
    }
    
    console.log("SpecializationManager: new selectedIds:", newSelected);
    onChange(newSelected);
  };

  // Handle successful creation of a new specialization
  const handleNewSpecializationSuccess = (newSpecialization) => {
    // Update the specializations list
    console.log("SpecializationManager: adding new specialization:", newSpecialization);
    setSpecializations(prev => [...prev, newSpecialization]);
    
    // Add the new specialization to selected items
    const newSelectedIds = [...selectedIds, newSpecialization.id];
    console.log("SpecializationManager: updating selectedIds with new specialization:", newSelectedIds);
    onChange(newSelectedIds);
  };

  // Toggle panel expansion
  const handleToggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6 bg-gray-800/30 rounded-lg border border-gray-700">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mr-3"></div>
        <span className="text-gray-300">Loading specializations...</span>
      </div>
    );
  }

  if (specializations.length === 0) {
    return (
      <div className="py-6 text-center bg-gray-800/30 rounded-lg border border-gray-700">
        <p className="text-gray-300 mb-4">No specializations available yet.</p>
        {allowEdit && (
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors flex items-center mx-auto"
          >
            <FiPlus className="mr-1.5" />
            Create First Specialization
          </button>
        )}
        
        <AnimatePresence>
          {showNewForm && (
            <NewSpecializationForm 
              onClose={() => setShowNewForm(false)}
              onSuccess={handleNewSpecializationSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected specializations */}
      <div className="flex flex-wrap gap-2 mb-4">
        {getSelectedSpecializations().map(spec => (
          <div 
            key={spec.id}
            className="bg-purple-900/40 text-purple-200 border border-purple-700/50 px-3 py-1.5 rounded-md text-sm flex items-center gap-2 group"
          >
            {spec.name}
            {allowEdit && (
              <button 
                onClick={(e) => handleSelect(spec.id, e)} 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove specialization"
              >
                <FiX className="w-4 h-4 text-purple-300 hover:text-white" />
              </button>
            )}
          </div>
        ))}
        
        {selectedIds.length === 0 && (
          <div className="text-gray-400 text-sm">
            No specializations selected.
          </div>
        )}
      </div>
      
      {allowEdit && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <button
              onClick={handleToggleExpand}
              className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              {isExpanded ? (
                <>
                  <FiX className="w-4 h-4" />
                  Close Specialization Selector
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  Select Specializations
                </>
              )}
            </button>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="border border-gray-700 rounded-lg p-4 bg-gray-800/70 w-full overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: 1,
                  height: "auto", 
                  transition: { 
                    height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                    opacity: { duration: 0.3, delay: 0.1 }
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0,
                  transition: { 
                    height: { duration: 0.3 },
                    opacity: { duration: 0.2 }
                  }
                }}
                layout
              >
                {/* Search input */}
                <div className="relative mb-4 z-10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-500 w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Search specializations..."
                    className="block w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                {/* Specializations grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSpecializations.map(spec => (
                    <div 
                      key={spec.id}
                      onClick={(e) => handleSelect(spec.id, e)}
                      className={`
                        flex items-center p-3 rounded-lg cursor-pointer transition-all
                        ${selectedIds.includes(spec.id) 
                          ? 'bg-purple-900/30 border-2 border-purple-500' 
                          : 'bg-gray-700/40 hover:bg-gray-700/60 border-2 border-transparent'}
                      `}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-200">
                          {spec.name}
                        </h3>
                        {spec.description && (
                          <p className="text-sm text-gray-400">
                            {spec.description}
                          </p>
                        )}
                      </div>
                      <div className={`
                        w-6 h-6 flex items-center justify-center rounded-full
                        ${selectedIds.includes(spec.id)
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-600'}
                      `}>
                        {selectedIds.includes(spec.id) && <FiCheck />}
                      </div>
                    </div>
                  ))}
                  
                  {filteredSpecializations.length === 0 && (
                    <div className="col-span-full text-center py-6 text-gray-400">
                      No specializations found matching your search.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Form for adding new specialization */}
      <AnimatePresence>
        {showNewForm && (
          <NewSpecializationForm 
            onClose={() => setShowNewForm(false)}
            onSuccess={handleNewSpecializationSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecializationManager; 