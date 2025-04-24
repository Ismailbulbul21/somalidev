import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ascxmtjwmwjajcbyener.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3htdGp3bXdqYWpjYnllbmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMjgzODAsImV4cCI6MjA2MDkwNDM4MH0.VWukwJs4XGXQuj49mpHTlXZHtZgNqYaaq1A0gqSaT1U';

console.log('Initializing Supabase client with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCategories = async () => {
    console.log('getCategories function called');

    try {
        // Make a direct query to the categories table
        const response = await supabase
            .from('categories')
            .select('*')
            .order('name');

        // Log detailed information for debugging
        console.log('Categories response:', response);
        console.log('Categories data:', response.data);
        console.log('Categories error:', response.error);
        console.log('Categories status:', response.status);

        // Handle error case
        if (response.error) {
            console.error('Error fetching categories:', response.error);
            throw new Error(response.error.message);
        }

        // Ensure we always return an array, even if data is null
        return Array.isArray(response.data) ? response.data : [];

    } catch (error) {
        console.error('Exception in getCategories:', error);
        return [];
    }
};

export const getSkills = async (category) => {
    let query = supabase.from('skills').select('*');
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const getProfiles = async (category) => {
    console.log('getProfiles called with category:', category);

    try {
        // Step 1: Get all profiles with their skills
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select(`
                *,
                profile_skills(
                    *,
                    skills(*)
                )
            `);

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            throw profilesError;
        }

        console.log(`Retrieved ${profiles?.length || 0} profiles`);

        // If no category specified, return all profiles
        if (!category) {
            return profiles || [];
        }

        // Step 2: Get category ID if it exists - we need this for primary_categories matching
        let categoryId = null;
        try {
            // First check if it's a valid UUID - if so, use it directly
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)) {
                categoryId = category;
                console.log(`Using provided category ID: ${categoryId}`);
            } else {
                // Otherwise, try to find category ID by name
                const { data: categoryData } = await supabase
                    .from('categories')
                    .select('id')
                    .ilike('name', category)
                    .maybeSingle();

                if (categoryData) {
                    categoryId = categoryData.id;
                    console.log(`Found category ID for "${category}": ${categoryId}`);
                }
            }
        } catch (error) {
            console.error('Error fetching category ID:', error);
            // Continue without categoryId
        }

        // Step 3: Filter profiles that match either:
        // 1. Have a skill with matching category name, OR
        // 2. Have the category ID in their primary_categories
        const filteredProfiles = profiles.filter(profile => {
            // Check for skills in the category
            const hasSkillInCategory = profile.profile_skills &&
                profile.profile_skills.some(ps => ps.skills && ps.skills.category === category);

            // Check for category in primary_categories (if we have categoryId)
            const hasPrimaryCategory = categoryId &&
                profile.primary_categories &&
                Array.isArray(profile.primary_categories) &&
                profile.primary_categories.includes(categoryId);

            // Debug info
            if (hasSkillInCategory || hasPrimaryCategory) {
                console.log(`Profile "${profile.full_name}" matches category "${category}":`, {
                    hasSkillInCategory,
                    hasPrimaryCategory,
                    skills: profile.profile_skills?.map(ps => ps.skills?.name)
                });
            }

            return hasSkillInCategory || hasPrimaryCategory;
        });

        console.log(`Filtered to ${filteredProfiles.length} profiles in category '${category}'`);
        return filteredProfiles;
    } catch (error) {
        console.error('Exception in getProfiles:', error);
        return [];
    }
};

export const getProfile = async (id) => {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
      *,
      profile_skills(
        *,
        skills(*)
      ),
      projects(
        *,
        project_media(*),
        project_skills(
          *,
          skills(*)
        )
      ),
      learning_paths(
        *,
        skills(*)
      )
    `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const updateProfile = async (id, updates) => {
    try {
        // Ensure id is valid
        if (!id) throw new Error('Profile ID is required');

        // Clean up the updates object to remove any undefined or invalid fields
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates)
                .filter(([_, value]) => value !== undefined)
        );

        // Validate years_of_experience is a number if present
        if (cleanUpdates.years_of_experience) {
            cleanUpdates.years_of_experience = parseInt(cleanUpdates.years_of_experience);
            if (isNaN(cleanUpdates.years_of_experience)) {
                throw new Error('Years of experience must be a number');
            }
        }

        // Skip this validation as we're using the database function instead
        /* 
        // Validate experience_level if present
        if (cleanUpdates.experience_level &&
            !['Bilow', 'Dhexe', 'Sare'].includes(cleanUpdates.experience_level)) {
            throw new Error('Invalid experience level');
        }
        */

        // Remove any fields that don't exist in the profiles table
        const { primary_categories, ...finalUpdates } = cleanUpdates;

        console.log("Cleaned profile updates:", finalUpdates);

        // Use our new RPC function instead of direct table update
        const { data, error } = await supabase.rpc('update_profile_with_somali_levels', {
            p_id: id,
            p_full_name: finalUpdates.full_name,
            p_bio: finalUpdates.bio,
            p_avatar_url: finalUpdates.avatar_url,
            p_location: finalUpdates.location,
            p_years_of_experience: finalUpdates.years_of_experience,
            p_experience_level: finalUpdates.experience_level,
            p_available_for_hire: finalUpdates.available_for_hire,
            p_website: finalUpdates.website,
            p_github: finalUpdates.github,
            p_twitter: finalUpdates.twitter,
            p_linkedin: finalUpdates.linkedin,
            p_username: finalUpdates.username
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const checkIfColumnExists = async (table, column) => {
    try {
        const { data, error } = await supabase.rpc('check_column_exists', {
            p_table: table,
            p_column: column
        });

        if (error) {
            console.error('Error checking if column exists:', error);
            return false;
        }

        return !!data; // Convert to boolean
    } catch (error) {
        console.error('Error checking if column exists:', error);
        return false;
    }
};

export const updatePrimaryCategories = async (userId, categories) => {
    try {
        // Ensure userId is valid
        if (!userId) throw new Error('User ID is required');

        // Ensure categories is an array
        const validCategories = Array.isArray(categories) ? categories : [];
        console.log("Updating primary categories:", validCategories);

        // Use the SQL function to update categories
        const { data, error } = await supabase
            .rpc('update_primary_categories', {
                user_id: userId,
                categories: validCategories
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating primary categories:', error);
        throw error;
    }
};

export const addProject = async (project) => {
    try {
        // Validate required fields
        if (!project.title) {
            throw new Error('Project title is required');
        }

        if (!project.profile_id) {
            throw new Error('Profile ID is required');
        }

        console.log('Adding project to database:', JSON.stringify(project, null, 2));

        // Check if thumbnail_url exists but is null or empty string
        if (project.hasOwnProperty('thumbnail_url') && !project.thumbnail_url) {
            console.log('Removing empty thumbnail_url property');
            // Remove the thumbnail_url property if it's empty to avoid database constraints
            const { thumbnail_url, ...projectWithoutEmptyImage } = project;
            project = projectWithoutEmptyImage;
        }

        const { data, error } = await supabase
            .from('projects')
            .insert(project)
            .select();

        if (error) {
            console.error('Supabase error adding project:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('No data returned after inserting project');
        }

        console.log('Project added successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in addProject function:', error);
        throw error;
    }
};

export const updateProject = async (id, updates) => {
    try {
        // Validate required fields
        if (!id) {
            throw new Error('Project ID is required');
        }

        console.log('Updating project with ID:', id);
        console.log('Project updates:', JSON.stringify(updates, null, 2));

        // Check if thumbnail_url exists but is null or empty string
        if (updates.hasOwnProperty('thumbnail_url') && !updates.thumbnail_url) {
            console.log('Removing empty thumbnail_url property');
            // Remove the thumbnail_url property if it's empty to avoid database constraints
            const { thumbnail_url, ...updatesWithoutEmptyImage } = updates;
            updates = updatesWithoutEmptyImage;
        }

        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error updating project:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('No data returned after updating project');
        }

        console.log('Project updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in updateProject function:', error);
        throw error;
    }
};

export const addProjectMedia = async (media) => {
    const { data, error } = await supabase
        .from('project_media')
        .insert(media)
        .select();

    if (error) throw error;
    return data;
};

export const addSkillToProfile = async (profileSkill) => {
    const { data, error } = await supabase
        .from('profile_skills')
        .insert(profileSkill)
        .select();

    if (error) throw error;
    return data;
};

export const updateProfileSkill = async (id, updates) => {
    const { data, error } = await supabase
        .from('profile_skills')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const addLearningPath = async (learningPath) => {
    const { data, error } = await supabase
        .from('learning_paths')
        .insert(learningPath)
        .select();

    if (error) throw error;
    return data;
};

export const updateLearningPath = async (id, updates) => {
    const { data, error } = await supabase
        .from('learning_paths')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const sendMessage = async (message) => {
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select();

    if (error) throw error;
    return data;
};

export const getMessages = async (userId) => {
    if (!userId) return [];

    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting messages:', error);
        return [];
    }
};

export const uploadImage = async (bucket, filePath, file) => {
    try {
        console.log(`Attempting to upload to bucket: ${bucket}, path: ${filePath}`);

        // Check if file is provided
        if (!file) {
            throw new Error('No file provided for upload');
        }

        // Validate bucket name
        if (!bucket) {
            throw new Error('Bucket name is required');
        }

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Supabase storage upload error:', error);
            throw error;
        }

        console.log('Upload successful:', data);
        return data;
    } catch (error) {
        console.error('Error in uploadImage function:', error);
        throw error;
    }
};

export const getImageUrl = (bucket, filePath) => {
    try {
        // Validate inputs
        if (!bucket) {
            console.error('Bucket name is required for getImageUrl');
            return null;
        }

        if (!filePath) {
            console.error('File path is required for getImageUrl');
            return null;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        if (!data || !data.publicUrl) {
            console.error('Failed to get public URL for', bucket, filePath);
            return null;
        }

        return data.publicUrl;
    } catch (error) {
        console.error('Error in getImageUrl function:', error);
        return null;
    }
};

export const removeSkillFromProfile = async (profileSkillId) => {
    const { data, error } = await supabase
        .from('profile_skills')
        .delete()
        .eq('id', profileSkillId)
        .select();

    if (error) throw error;
    return data;
};

export const getSpecializations = async () => {
    try {
        const { data, error } = await supabase
            .from('specializations')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching specializations:', error);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Unexpected error fetching specializations:', error);
        return [];
    }
};

export const updateSpecializations = async (userId, specializationIds) => {
    try {
        // First update the user's profile with the specialization IDs
        const { error } = await supabase
            .from('profiles')
            .update({
                specializations: specializationIds,
                updated_at: new Date()
            })
            .eq('id', userId);

        if (error) {
            console.error('Error updating specializations:', error);
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true
        };
    } catch (error) {
        console.error('Unexpected error updating specializations:', error);
        return {
            success: false,
            error: 'An unexpected error occurred'
        };
    }
};

export const createSpecialization = async (specialization) => {
    try {
        // Validate required fields
        if (!specialization.name || !specialization.name.trim()) {
            return {
                error: { message: 'Specialization name is required' }
            };
        }

        // Insert the specialization into the database
        const { data, error } = await supabase
            .from('specializations')
            .insert(specialization)
            .select();

        if (error) {
            console.error('Error creating specialization:', error);
            return { error };
        }

        if (!data || data.length === 0) {
            return {
                error: { message: 'No data returned after inserting specialization' }
            };
        }

        console.log('Specialization created successfully:', data[0]);
        return { data: data[0] };
    } catch (error) {
        console.error('Unexpected error creating specialization:', error);
        return {
            error: { message: 'An unexpected error occurred' }
        };
    }
};