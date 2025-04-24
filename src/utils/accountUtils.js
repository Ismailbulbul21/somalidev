/**
 * Get the account type of a user
 * @param {Object} user - The user object from useAuth()
 * @returns {String} The account type ('developer' or 'company') or 'developer' as default
 */
export const getUserAccountType = (user) => {
    if (!user) return null;

    // If account_type exists in user metadata, return it
    if (user.user_metadata?.account_type) {
        return user.user_metadata.account_type;
    }

    // Default to 'developer' if no account type is set
    return 'developer';
};

/**
 * Check if the user is a developer
 * @param {Object} user - The user object from useAuth()
 * @returns {Boolean} True if the user is a developer, false otherwise
 */
export const isDeveloper = (user) => {
    return getUserAccountType(user) === 'developer';
};

/**
 * Check if the user is a company
 * @param {Object} user - The user object from useAuth()
 * @returns {Boolean} True if the user is a company, false otherwise
 */
export const isCompany = (user) => {
    return getUserAccountType(user) === 'company';
};

/**
 * Get display text for the account type
 * @param {String} accountType - The account type string
 * @returns {String} Human-readable account type label
 */
export const getAccountTypeLabel = (accountType) => {
    switch (accountType) {
        case 'developer':
            return 'Developer';
        case 'company':
            return 'Company';
        default:
            return 'User';
    }
}; 