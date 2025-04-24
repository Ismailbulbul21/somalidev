import React from 'react';
import { useAuth } from '../../utils/AuthContext';
import { getUserAccountType, getAccountTypeLabel } from '../../utils/accountUtils';

/**
 * A component that displays the user's account type
 */
const AccountTypeIndicator = ({ showLabel = true }) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const accountType = getUserAccountType(user);
  const label = getAccountTypeLabel(accountType);
  
  return (
    <div className="inline-flex items-center">
      {accountType === 'developer' ? (
        <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-1 rounded-full">
          {showLabel ? label : ''}
          <svg className={`w-4 h-4 ${!showLabel ? '' : 'ml-1'} inline-block`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      ) : accountType === 'company' ? (
        <span className="bg-green-900/40 text-green-300 text-xs px-2 py-1 rounded-full">
          {showLabel ? label : ''}
          <svg className={`w-4 h-4 ${!showLabel ? '' : 'ml-1'} inline-block`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        </span>
      ) : (
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
          {showLabel ? 'User' : ''}
          <svg className={`w-4 h-4 ${!showLabel ? '' : 'ml-1'} inline-block`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </div>
  );
};

export default AccountTypeIndicator; 