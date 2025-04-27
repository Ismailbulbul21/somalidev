import React, { useState } from 'react';
import { syncPostCategories } from '../../utils/categoryUtils';
import { supabase } from '../../utils/supabaseClient';

const SyncCategoriesButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);
      
      // Call the database function to sync categories
      const { data, error } = await supabase.rpc('sync_categories');
      
      if (error) {
        console.error('Error syncing categories:', error);
        setSyncResult({ 
          success: false, 
          error: error.message || 'Failed to sync categories'
        });
        return;
      }
      
      setSyncResult(data);
      console.log('Sync result:', data);
    } catch (error) {
      console.error('Error syncing categories:', error);
      setSyncResult({ success: false, error: error.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col space-y-2">
        <p className="text-sm text-gray-400 mb-2">
          If category filtering isn't working correctly, use this button to fix category relationships.
        </p>
        <button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? 'Syncing...' : 'Sync Post Categories'}
        </button>
      </div>
      
      {syncResult && (
        <div className={`mt-2 p-2 rounded ${syncResult.success ? 'bg-green-900/40 border border-green-700 text-green-400' : 'bg-red-900/40 border border-red-700 text-red-400'}`}>
          {syncResult.success 
            ? `Successfully synced ${syncResult.updated_count || 0} posts with correct category IDs.`
            : `Error syncing categories: ${syncResult.error}`
          }
        </div>
      )}
    </div>
  );
};

export default SyncCategoriesButton; 