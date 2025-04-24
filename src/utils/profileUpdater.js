import { supabase } from './supabaseClient.jsx';

/**
 * Update a profile, bypassing the experience level validation issue
 * @param {string} id - User ID
 * @param {object} updates - Updates to apply to the profile
 * @param {Array} [primaryCategories] - Optional array of primary category IDs
 * @param {Array} [specializations] - Optional array of specialization IDs
 * @returns {Promise<object>} Updated profile data
 */
export const updateProfileSafe = async (id, updates, primaryCategories, specializations) => {
    try {
        // Ensure id is valid
        if (!id) throw new Error('Profile ID is required');

        console.log("Using direct update method for profile:", id);

        // First, handle experience_level separately if it exists
        if (updates.experience_level) {
            console.log("Updating experience level directly:", updates.experience_level);

            // Call our special function to update experience level directly
            const { error: levelError } = await supabase.rpc('update_profile_direct', {
                profile_id: id,
                experience_level: updates.experience_level
            });

            if (levelError) {
                console.error("Error updating experience level:", levelError);
                throw levelError;
            }

            // Remove it from the updates object
            const { experience_level, ...otherUpdates } = updates;
            updates = otherUpdates;
        }

        // Handle primary categories if provided
        if (Array.isArray(primaryCategories)) {
            console.log("Updating primary categories directly:", primaryCategories);
            try {
                const { error: catError } = await supabase.rpc('update_primary_categories', {
                    user_id: id,
                    categories: primaryCategories
                });

                if (catError) {
                    console.error("Error updating primary categories:", catError);
                    // Continue with other updates
                }
            } catch (catError) {
                console.error("Exception updating primary categories:", catError);
                // Continue with other updates
            }
        }

        // Handle specializations if provided
        if (Array.isArray(specializations)) {
            console.log("Updating specializations directly:", specializations);
            try {
                const { error: specError } = await supabase
                    .from('profiles')
                    .update({
                        specializations: specializations,
                        updated_at: new Date()
                    })
                    .eq('id', id);

                if (specError) {
                    console.error("Error updating specializations:", specError);
                    // Continue with other updates
                }
            } catch (specError) {
                console.error("Exception updating specializations:", specError);
                // Continue with other updates
            }
        }

        // Only proceed with other profile updates if there are any
        if (Object.keys(updates).length > 0) {
            console.log("Updating other profile fields:", updates);

            // Now update the rest of the fields normally
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
        }

        // Fetch the updated profile
        const { data: updatedProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        return updatedProfile;

    } catch (error) {
        console.error('Error in updateProfileSafe:', error);
        throw error;
    }
}; 