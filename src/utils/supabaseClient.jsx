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
        console.log('Supabase URL being used:', supabaseUrl);

        // Handle error case
        if (response.error) {
            console.error('Error fetching categories:', response.error);
            // Instead of throwing, return fallback data
            console.log('Returning fallback categories due to error');
            return [
                { id: 'web-dev', name: 'Web Development', description: 'Development of websites and web applications' },
                { id: 'mobile-dev', name: 'Mobile Development', description: 'Development of applications for mobile devices' },
                { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and user experience design' },
                { id: 'data-science', name: 'Data Science', description: 'Analysis and interpretation of complex data' },
                { id: 'ml-ai', name: 'Machine Learning', description: 'Artificial intelligence and machine learning' },
                { id: 'game-dev', name: 'Game Development', description: 'Development of video games and interactive applications' },
                { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protection of systems, networks, and programs from digital attacks' },
            ];
        }

        // If no data returned or empty array, return fallback categories
        if (!response.data || response.data.length === 0) {
            console.log('No categories found in database, returning fallback categories');
            return [
                { id: 'web-dev', name: 'Web Development', description: 'Development of websites and web applications' },
                { id: 'mobile-dev', name: 'Mobile Development', description: 'Development of applications for mobile devices' },
                { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and user experience design' },
                { id: 'data-science', name: 'Data Science', description: 'Analysis and interpretation of complex data' },
                { id: 'ml-ai', name: 'Machine Learning', description: 'Artificial intelligence and machine learning' },
                { id: 'game-dev', name: 'Game Development', description: 'Development of video games and interactive applications' },
                { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protection of systems, networks, and programs from digital attacks' },
            ];
        }

        // Return the data array
        return response.data;

    } catch (error) {
        console.error('Exception in getCategories:', error);
        // Return fallback categories instead of empty array
        return [
            { id: 'web-dev', name: 'Web Development', description: 'Development of websites and web applications' },
            { id: 'mobile-dev', name: 'Mobile Development', description: 'Development of applications for mobile devices' },
            { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and user experience design' },
            { id: 'data-science', name: 'Data Science', description: 'Analysis and interpretation of complex data' },
            { id: 'ml-ai', name: 'Machine Learning', description: 'Artificial intelligence and machine learning' },
            { id: 'game-dev', name: 'Game Development', description: 'Development of video games and interactive applications' },
            { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protection of systems, networks, and programs from digital attacks' },
        ];
    }
};

// Alias for getCategories function for backward compatibility
export const fetchCategories = getCategories;

export const getSkills = async (category) => {
    let query = supabase.from('skills').select('*');
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

/**
 * Get all profiles or specific profiles by IDs
 * @param {Array} ids - Optional array of profile IDs
 * @param {Object} options - Additional options
 * @param {string} options.sortBy - Field to sort by ('rating', 'created_at', etc.)
 * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
 * @param {number} options.limit - Maximum number of profiles to return
 * @param {string} options.specialization - Optional specialization ID to filter by
 * @returns {Promise<Array>} Array of profile objects
 */
export const getProfiles = async (ids = [], options = {}) => {
  try {
    const { 
      sortBy = 'created_at', 
      sortOrder = 'desc', 
      limit = null,
      specialization = null
    } = options;
    
    let query = supabase
      .from('profiles')
      .select(`
        *,
        profile_skills (
          id,
          skill_id,
          proficiency_level,
          is_learning,
          skills (
            id, 
            name,
            category
          )
        ),
        projects (
          id,
          title,
          description,
          thumbnail_url,
          github_url,
          live_url,
          created_at,
          project_skills (
            skills (
              name
            )
          )
        )
      `);
    
    // Apply filters
    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }
    
    if (specialization) {
      query = query.contains('specializations', [specialization]);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
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

// Upload media for a post
export const addPostMedia = async (postId, file, mediaType = 'image') => {
  try {
    if (!postId) throw new Error('Post ID is required');
    if (!file) throw new Error('File is required');
    
    // Upload the file to storage
    const filePath = `post_media/${postId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await uploadImage('post-media', filePath, file);
    
    if (uploadError) {
      console.error('Error uploading post media:', uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const publicUrl = getImageUrl('post-media', filePath);
    
    // Log the URL for debugging
    console.log('Generated public URL for media:', publicUrl);
    
    if (!publicUrl) {
      console.error('Could not generate public URL for media');
      throw new Error('Media URL generation failed');
    }
    
    // Add entry to post_media table
    const { data, error } = await supabase
      .from('post_media')
      .insert([{
        post_id: postId,
        url: publicUrl,
        media_type: mediaType
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding post media record:', error);
      throw error;
    }
    
    // Return data with the URL included
    return { ...data, url: publicUrl };
  } catch (error) {
    console.error('Exception in addPostMedia:', error);
    throw error;
  }
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

// Community Posts Functions

// Get posts with pagination, filtering, and sorting
export const getPosts = async ({
  page = 1,
  pageSize = 10,
  filter = {},
  sortBy = 'created_at',
  sortOrder = 'desc'
}) => {
  try {
    console.log('Getting posts with params:', { page, pageSize, filter, sortBy, sortOrder });
    
    // Calculate offset based on page and pageSize
    const offset = (page - 1) * pageSize;
    
    // Start building the query
    let query = supabase
      .from('post_feed')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filter) {
      // Post type filter
      if (filter.postType) {
        query = query.eq('post_type', filter.postType);
        console.log(`Filtering by post_type: ${filter.postType}`);
      }
      
      // Category filter
      if (filter.categoryId) {
        console.log(`Filtering by category: ${filter.categoryId}`);
        
        // Check if it's a valid UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filter.categoryId);
        
        if (isUuid) {
          // If it's already a UUID, use direct match on category_id
          query = query.eq('category_id', filter.categoryId);
          console.log(`Using direct category filter with UUID: ${filter.categoryId}`);
      } else {
          // If not a UUID, try to convert it
          try {
            const { convertCategoryId } = await import('./categoryUtils.js');
            const convertedId = await convertCategoryId(filter.categoryId);
            
            if (convertedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(convertedId)) {
              // Use the converted UUID
              query = query.eq('category_id', convertedId);
              console.log(`Using converted category ID: ${convertedId}`);
            } else {
              // Fallback to searching by category name if conversion fails
              const categoryName = filter.categoryId.replace(/-/g, ' ')
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
        
        query = query.ilike('category_name', `%${categoryName}%`);
              console.log(`Using category name filter: ${categoryName}`);
            }
          } catch (error) {
            console.error('Error converting category ID:', error);
            // Still try to perform some filtering even if conversion fails
            const categoryName = filter.categoryId.replace(/-/g, ' ');
            query = query.ilike('category_name', `%${categoryName}%`);
          }
        }
      }
      
      // Search filter
      if (filter.searchTerm && filter.searchTerm.trim()) {
        const searchTerm = filter.searchTerm.trim();
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
        console.log(`Searching for: ${searchTerm}`);
      }
    }
    
    // Apply sorting
    if (sortBy) {
      const direction = sortOrder?.toLowerCase() === 'asc' ? true : false;
      query = query.order(sortBy, { ascending: direction });
      console.log(`Sorting by ${sortBy} ${direction ? 'ASC' : 'DESC'}`);
    }
    
    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
      return { data: [], count: 0, error };
    }
    
    console.log(`Successfully fetched ${data.length} posts`);
    return { data, count, error: null };
  } catch (error) {
    console.error('Exception in getPosts:', error);
    return { data: [], count: 0, error };
  }
};

// Get a single post by ID with all associated data
export const getPost = async (postId) => {
  try {
    if (!postId) throw new Error('Post ID is required');
    
    console.log('Fetching post with ID:', postId);
    
    // Try to increment view count, but don't let it block the main functionality
    viewPost(postId).catch(err => {
      console.warn('View count increment failed:', err);
    });
    
    // Get the post details directly from posts table
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:profile_id (*),
        categories:category_id (id, name, description)
      `)
      .eq('id', postId)
      .single();
    
    if (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
    
    // Get comments for the post
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!comments_profile_id_fkey(id, full_name, avatar_url, title),
        comment_likes(count)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Get like count
    const { count: likeCount, error: likeError } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);
      
    if (likeError) {
      console.warn('Error fetching like count:', likeError);
    }
    
    console.log('Successfully fetched post:', data?.id);
    
    return {
      ...data,
      comments: comments || [],
      like_count: likeCount || 0
    };
  } catch (error) {
    console.error('Exception in getPost:', error);
    throw error;
  }
};

// Function to create a post
export const createPost = async (post) => {
  try {
    console.log('Creating post:', post);
    
    let postData = {};
    let mediaFile = null;
    
    // Check if post is FormData
    if (post instanceof FormData) {
      const title = post.get('title');
      const content = post.get('content');
      const post_type = post.get('post_type');
      let category_id = post.get('category_id');
      const tagsString = post.get('tags');
      
      // Extract media file if present
      mediaFile = post.get('media');
      
      console.log('Extracted from FormData:', { 
        title, content, post_type, category_id, tagsString,
        hasMedia: !!mediaFile
      });
      
      if (!title) throw new Error('Post title is required');
      if (!content) throw new Error('Post content is required');
      
      postData = {
        title,
        content,
        post_type: post_type || 'discussion'
      };
      
      // Handle category ID - ensure it's a valid UUID
      if (category_id) {
        // Check if already a valid UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)) {
          console.log(`Category ID is a valid UUID: ${category_id}`);
          
          // Verify this UUID exists in the categories table
          const { data: categoryExists } = await supabase
            .from('categories')
            .select('id, name')
            .eq('id', category_id)
            .single();
          
          if (categoryExists) {
            console.log(`Verified category exists: ${categoryExists.name} (${categoryExists.id})`);
            postData.category_id = category_id;
          } else {
            console.log('UUID not found in categories table, finding alternative');
            const { data: altCategory } = await supabase
              .from('categories')
              .select('id, name')
              .limit(1)
              .single();
            
            if (altCategory) {
              category_id = altCategory.id;
              console.log(`Using alternative category ID: ${altCategory.name} (${category_id})`);
              postData.category_id = category_id;
            }
          }
        } else {
          console.log(`Category ID is not a UUID, converting: ${category_id}`);
          
          // First try special case handling for common categories
          let matchingCategoryName = null;
          const normalizedCategoryId = category_id.toLowerCase().replace(/-/g, ' ');
          
          if (normalizedCategoryId.includes('web')) {
            matchingCategoryName = 'Web Development';
          } else if (normalizedCategoryId.includes('mobile')) {
            matchingCategoryName = 'Mobile Development';
          } else if (normalizedCategoryId.includes('ui') || normalizedCategoryId.includes('ux') || normalizedCategoryId.includes('design')) {
            matchingCategoryName = 'UI/UX Design';
          }
          
          if (matchingCategoryName) {
            console.log(`Special case match: "${normalizedCategoryId}" → "${matchingCategoryName}"`);
            const { data: specialCategory } = await supabase
              .from('categories')
              .select('id, name')
              .ilike('name', matchingCategoryName)
              .limit(1);
              
            if (specialCategory && specialCategory.length > 0) {
              category_id = specialCategory[0].id;
              console.log(`Found special category: ${specialCategory[0].name} (${category_id})`);
              postData.category_id = category_id;
            }
          }
          
          // If special case didn't find a match, try direct lookup
          if (!postData.category_id) {
            const { data: categoryByName } = await supabase
              .from('categories')
              .select('id, name')
              .or(`name.ilike.%${normalizedCategoryId}%,slug.eq.${category_id}`)
              .limit(1);
            
            if (categoryByName && categoryByName.length > 0) {
              category_id = categoryByName[0].id;
              console.log(`Found category by name: ${categoryByName[0].name} (${category_id})`);
              postData.category_id = category_id;
            } else {
              // If direct lookup fails, try the conversion utility
              try {
                const { convertCategoryId } = await import('./categoryUtils.js');
                const convertedId = await convertCategoryId(category_id);
                
                if (convertedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(convertedId)) {
                  category_id = convertedId;
                  console.log(`Converted to valid UUID: ${category_id}`);
                  postData.category_id = category_id;
                } else if (convertedId) {
                  // If conversion returned something but not a UUID, try one more direct lookup
                  const { data: convertedCategory } = await supabase
                    .from('categories')
                    .select('id, name')
                    .or(`name.ilike.%${convertedId.replace(/-/g, ' ')}%,id.eq.${convertedId}`)
                    .limit(1);
                    
                  if (convertedCategory && convertedCategory.length > 0) {
                    category_id = convertedCategory[0].id;
                    console.log(`Found category from converted ID: ${convertedCategory[0].name} (${category_id})`);
                    postData.category_id = category_id;
                  }
                }
              } catch (convError) {
                console.error('Error during category conversion:', convError);
              }
            }
          }
          
          // If all attempts fail, get any valid category as fallback
          if (!postData.category_id) {
            console.log('All conversion attempts failed, using fallback category');
            const { data: fallbackCategory } = await supabase
              .from('categories')
              .select('id, name')
              .limit(1)
              .single();
            
            if (fallbackCategory) {
              category_id = fallbackCategory.id;
              console.log(`Using fallback category: ${fallbackCategory.name} (${category_id})`);
              postData.category_id = category_id;
    } else {
              console.log('No fallback category found, setting to null');
              postData.category_id = null;
            }
          }
        }
      } else {
        console.log('No category ID provided, finding a default');
        // No category provided, get a default one
        const { data: defaultCategory } = await supabase
          .from('categories')
          .select('id, name')
          .limit(1)
          .single();
        
        if (defaultCategory) {
          postData.category_id = defaultCategory.id;
          console.log(`Using default category: ${defaultCategory.name} (${defaultCategory.id})`);
        }
      }
      
      // Process tags if present
      if (tagsString) {
        try {
          postData.tags = JSON.parse(tagsString);
        } catch (e) {
          console.error('Error parsing tags JSON:', e);
        }
      }
    } else {
      // If it's not FormData, use it directly
      postData = { ...post };
      
      // Ensure category_id is a valid UUID if provided
      if (postData.category_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postData.category_id)) {
        try {
          console.log(`Converting non-UUID category_id: ${postData.category_id}`);
          const { convertCategoryId } = await import('./categoryUtils.js');
          const convertedId = await convertCategoryId(postData.category_id);
          
          if (convertedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(convertedId)) {
            postData.category_id = convertedId;
            console.log(`Converted to UUID: ${convertedId}`);
          } else {
            // Get any valid category
            const { data: anyCategory } = await supabase
              .from('categories')
              .select('id, name')
              .limit(1)
              .single();
              
            if (anyCategory) {
              postData.category_id = anyCategory.id;
              console.log(`Using first available category: ${anyCategory.name} (${anyCategory.id})`);
            }
          }
        } catch (error) {
          console.error('Error converting category ID in direct post data:', error);
        }
      }
    }
    
    // Set the profile ID to the current user
    const { data: { user } } = await supabase.auth.getUser();
    postData.profile_id = user.id;
    
    console.log('Final post data:', postData);
    
    // Insert the post
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select(`
        *,
        profiles:profile_id (*),
        categories:category_id (*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }
    
    console.log('Post created successfully:', data);
    
    // Handle media upload if file was provided
    if (mediaFile) {
      try {
        console.log('Uploading media file for post:', data.id);
        const mediaData = await addPostMedia(data.id, mediaFile);
        console.log('Media upload successful:', mediaData);
        
        // Update the post with the media URL
        if (mediaData && mediaData.url) {
          const { data: updatedPost, error: updateError } = await supabase
            .from('posts')
            .update({ media_url: mediaData.url })
            .eq('id', data.id)
            .select(`
              *,
              profiles:profile_id (*),
              categories:category_id (*)
            `)
            .single();
            
          if (updateError) {
            console.error('Error updating post with media URL:', updateError);
            // Still return original data with the media URL added
            return { ...data, media_url: mediaData.url };
          } else {
            console.log('Post updated with media URL:', updatedPost);
            // Return the updated post with the media URL
            return updatedPost;
          }
        }
      } catch (mediaError) {
        console.error('Error uploading media for post:', mediaError);
        // Continue even if media upload fails - post was created successfully
      }
    }
    
    return data;
  } catch (error) {
    console.error('Exception in createPost:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (postId, updates) => {
  try {
    if (!postId) throw new Error('Post ID is required');
    
    console.log('Updating post with ID:', postId);
    console.log('Update data:', updates);
    
    let updateData = {};
    let mediaFile = null;
    
    // Handle FormData
    if (updates instanceof FormData) {
      const title = updates.get('title');
      const content = updates.get('content');
      const post_type = updates.get('post_type');
      let category_id = updates.get('category_id');
      const tagsString = updates.get('tags');
      
      // Extract media file if present
      mediaFile = updates.get('media');
      
      console.log('Extracted from FormData:', { 
        title, content, post_type, category_id, tagsString,
        hasMedia: !!mediaFile
      });
      
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (post_type) updateData.post_type = post_type;
      
      // Handle category ID - ensure it's a valid UUID
      if (category_id) {
        // Check if already a valid UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)) {
          console.log(`Category ID is not a UUID, converting: ${category_id}`);
          try {
            // Import the utility function directly
            const { convertCategoryId } = await import('./categoryUtils.js');
            category_id = await convertCategoryId(category_id);
            console.log(`Converted category ID: ${category_id}`);
          } catch (error) {
            console.error('Error converting category ID:', error);
            // If conversion fails, try to get a default category ID from database
            try {
              const { data: defaultCategory } = await supabase
                .from('categories')
                .select('id')
                .limit(1)
                .single();
              
              if (defaultCategory) {
                category_id = defaultCategory.id;
                console.log(`Using default category ID: ${category_id}`);
              } else {
                category_id = null;
              }
            } catch (innerError) {
              console.error('Error getting default category:', innerError);
              category_id = null;
            }
          }
        } else {
          console.log('Category ID is already a valid UUID');
        }
        
        updateData.category_id = category_id;
      }
      
      // Handle tags
      if (tagsString) {
        try {
          const tags = JSON.parse(tagsString);
          if (Array.isArray(tags)) {
            updateData.tags = tags;
          }
        } catch (error) {
          console.error('Error parsing tags:', error);
        }
      }
    } else {
      // Handle regular object
      updateData = { ...updates };
    }
    
    // Log the final data object before update
    console.log('Final update data:', updateData);
    
    // Update the post
    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select(`
        *,
        profiles!posts_profile_id_fkey(id, full_name, avatar_url, title),
        categories(id, name)
      `)
      .single();
    
    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }
    
    console.log('Post updated successfully:', data);
    
    // Handle media upload if file was provided
    if (mediaFile) {
      try {
        console.log('Uploading media file for updated post:', postId);
        const mediaData = await addPostMedia(postId, mediaFile);
        console.log('Media upload successful:', mediaData);
        
        // Update the post with the media URL
        if (mediaData && mediaData.url) {
          const { data: updatedPost, error: updateError } = await supabase
            .from('posts')
            .update({ media_url: mediaData.url })
            .eq('id', postId)
            .select();
            
          if (updateError) {
            console.error('Error updating post with media URL:', updateError);
          } else {
            console.log('Post updated with media URL:', updatedPost);
            // Return the updated post with the media URL
            return { ...data, media_url: mediaData.url };
          }
        }
      } catch (mediaError) {
        console.error('Error uploading media for post:', mediaError);
        // Continue even if media upload fails - post was updated successfully
      }
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updatePost:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    if (!postId) throw new Error('Post ID is required');
    
    // Delete the post (cascade will handle related records)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in deletePost:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (comment) => {
  try {
    if (!comment.post_id) throw new Error('Post ID is required');
    if (!comment.content) throw new Error('Comment content is required');
    
    // Insert the comment
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select(`
        *,
        profiles!comments_profile_id_fkey(id, full_name, avatar_url, title)
      `)
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in addComment:', error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (commentId, content) => {
  try {
    if (!commentId) throw new Error('Comment ID is required');
    if (!content) throw new Error('Comment content is required');
    
    // Update the comment
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateComment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    if (!commentId) throw new Error('Comment ID is required');
    
    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in deleteComment:', error);
    throw error;
  }
};

// Toggle like on a post
export const togglePostLike = async (postId) => {
  try {
    if (!postId) throw new Error('Post ID is required');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to like posts');
    
    // Check if user already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking post like:', checkError);
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike the post
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (unlikeError) {
        console.error('Error unliking post:', unlikeError);
        throw unlikeError;
      }
      
      return { liked: false };
    } else {
      // Like the post
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert([{
          post_id: postId,
          profile_id: user.id
        }]);
      
      if (likeError) {
        console.error('Error liking post:', likeError);
        throw likeError;
      }
      
      return { liked: true };
    }
  } catch (error) {
    console.error('Exception in togglePostLike:', error);
    throw error;
  }
};

// Like a post (always adds a like)
export const likePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to like posts');
    
    // Check if user already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking post like:', checkError);
      throw checkError;
    }
    
    // Only add like if not already liked
    if (!existingLike) {
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert([{
          post_id: postId,
          profile_id: user.id
        }]);
      
      if (likeError) {
        console.error('Error liking post:', likeError);
        throw likeError;
      }
    }
    
    return { liked: true };
  } catch (error) {
    console.error('Exception in likePost:', error);
    throw error;
  }
};

// Unlike a post (always removes a like)
export const unlikePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to unlike posts');
    
    // Find existing like
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking post like:', checkError);
      throw checkError;
    }
    
    // Remove like if exists
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (unlikeError) {
        console.error('Error unliking post:', unlikeError);
        throw unlikeError;
      }
    }
    
    return { liked: false };
  } catch (error) {
    console.error('Exception in unlikePost:', error);
    throw error;
  }
};

// Toggle save on a post
export const togglePostSave = async (postId) => {
  try {
    if (!postId) throw new Error('Post ID is required');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to save posts');
    
    // Check if user already saved the post
    const { data: existingSave, error: checkError } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking post save:', checkError);
      throw checkError;
    }
    
    if (existingSave) {
      // Unsave the post
      const { error: unsaveError } = await supabase
        .from('post_saves')
        .delete()
        .eq('id', existingSave.id);
      
      if (unsaveError) {
        console.error('Error unsaving post:', unsaveError);
        throw unsaveError;
      }
      
      return { saved: false };
    } else {
      // Save the post
      const { error: saveError } = await supabase
        .from('post_saves')
        .insert([{
          post_id: postId,
          profile_id: user.id
        }]);
      
      if (saveError) {
        console.error('Error saving post:', saveError);
        throw saveError;
      }
      
      return { saved: true };
    }
  } catch (error) {
    console.error('Exception in togglePostSave:', error);
    throw error;
  }
};

// Save a post (always adds a save)
export const savePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to save posts');
    
    // Check if user already saved the post
    const { data: existingSave, error: checkError } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking post save:', checkError);
      throw checkError;
    }
    
    // Only save if not already saved
    if (!existingSave) {
      const { error: saveError } = await supabase
        .from('post_saves')
        .insert([{
          post_id: postId,
          profile_id: user.id
        }]);
      
      if (saveError) {
        console.error('Error saving post:', saveError);
        throw saveError;
      }
    }
    
    return { saved: true };
  } catch (error) {
    console.error('Exception in savePost:', error);
    throw error;
  }
};

// Unsave a post (always removes a save)
export const unsavePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to unsave posts');
    
    // Find existing save
    const { data: existingSave, error: checkError } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking post save:', checkError);
      throw checkError;
    }
    
    // Remove save if exists
    if (existingSave) {
      const { error: unsaveError } = await supabase
        .from('post_saves')
        .delete()
        .eq('id', existingSave.id);
      
      if (unsaveError) {
        console.error('Error unsaving post:', unsaveError);
        throw unsaveError;
      }
    }
    
    return { saved: false };
  } catch (error) {
    console.error('Exception in unsavePost:', error);
    throw error;
  }
};

// Get saved posts with pagination
export const getSavedPosts = async (page = 1, pageSize = 10) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to view saved posts');
    
    const offset = (page - 1) * pageSize;
    
    // Get the saved post IDs first
    const { data: savedPostIds, error: savedError } = await supabase
      .from('post_saves')
      .select('post_id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (savedError) {
      console.error('Error fetching saved post IDs:', savedError);
      throw savedError;
    }
    
    if (!savedPostIds.length) return { data: [], count: 0 };
    
    // Get the actual posts
    const postIds = savedPostIds.map(item => item.post_id);
    const { data: posts, error: postsError, count } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:profile_id(id, full_name, avatar_url),
        comments:comments(count),
        likes:post_likes(count)
      `, { count: 'exact' })
      .in('id', postIds)
      .order('created_at', { ascending: false });
    
    if (postsError) {
      console.error('Error fetching saved posts:', postsError);
      throw postsError;
    }
    
    return { data: posts, count };
  } catch (error) {
    console.error('Exception in getSavedPosts:', error);
    throw error;
  }
};

// Get posts by a specific user
export const getUserPosts = async (userId, page = 1, pageSize = 10) => {
  try {
    if (!userId) {
      // If no userId provided, use current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User ID is required or you must be logged in');
      userId = user.id;
    }
    
    const offset = (page - 1) * pageSize;
    
    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:profile_id(id, full_name, avatar_url),
        comments:comments(count),
        likes:post_likes(count)
      `, { count: 'exact' })
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
    
    return { data, count };
  } catch (error) {
    console.error('Exception in getUserPosts:', error);
    throw error;
  }
};

// Follow/unfollow a user
export const toggleUserFollow = async (followingId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to follow users');
    if (!followingId) throw new Error('User ID to follow is required');
    if (user.id === followingId) throw new Error('You cannot follow yourself');
    
    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking follow status:', checkError);
      throw checkError;
    }
    
    if (existingFollow) {
      // Unfollow
      const { error: unfollowError } = await supabase
        .from('user_follows')
        .delete()
        .eq('id', existingFollow.id);
      
      if (unfollowError) {
        console.error('Error unfollowing user:', unfollowError);
        throw unfollowError;
      }
      
      return { following: false };
    } else {
      // Follow
      const { error: followError } = await supabase
        .from('user_follows')
        .insert([{
          follower_id: user.id,
          following_id: followingId
        }]);
      
      if (followError) {
        console.error('Error following user:', followError);
        throw followError;
      }
      
      return { following: true };
    }
  } catch (error) {
    console.error('Exception in toggleUserFollow:', error);
    throw error;
  }
};

// Check if current user is following another user
export const checkIfFollowing = async (followingId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !followingId) return false;
    
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error('Exception in checkIfFollowing:', error);
    return false;
  }
};

// Get user's followers
export const getUserFollowers = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        id,
        created_at,
        followers:follower_id(id, full_name, avatar_url, title)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user followers:', error);
      throw error;
    }
    
    return data?.map(item => item.followers) || [];
  } catch (error) {
    console.error('Exception in getUserFollowers:', error);
    return [];
  }
};

// Get users that a user is following
export const getUserFollowing = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        id,
        created_at,
        following:following_id(id, full_name, avatar_url, title)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user following:', error);
      throw error;
    }
    
    return data?.map(item => item.following) || [];
  } catch (error) {
    console.error('Exception in getUserFollowing:', error);
    return [];
  }
};

// Ratings Functions

/**
 * Get a specific rating from one user to another
 * @param {string} raterId - The ID of the user who gave the rating
 * @param {string} ratedId - The ID of the user who received the rating
 * @returns {Promise<Object|null>} - The rating object or null if not found
 */
export const getUserRatingFor = async (raterId, ratedId) => {
  try {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('rater_id', raterId)
      .eq('rated_id', ratedId)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return null;
  }
};

/**
 * Create or update a rating
 * @param {string} raterId - The ID of the user giving the rating
 * @param {string} ratedId - The ID of the user being rated
 * @param {number} ratingValue - The rating value (1-5)
 * @param {string} comment - Optional comment with the rating
 * @returns {Promise<Object>} - The created or updated rating
 */
export const createOrUpdateRating = async (raterId, ratedId, ratingValue, comment = null) => {
  try {
    // Check if a rating already exists
    const existingRating = await getUserRatingFor(raterId, ratedId);
    
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('user_ratings')
        .update({
          rating_value: ratingValue,
          comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select();
        
      if (error) throw error;
      return data;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('user_ratings')
        .insert({
          rater_id: raterId,
          rated_id: ratedId,
          rating_value: ratingValue,
          comment: comment
        })
        .select();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    throw error;
  }
};

/**
 * Get all ratings for a user
 * @param {string} userId - The ID of the user to get ratings for
 * @returns {Promise<Array>} - Array of rating objects with rater profile info
 */
export const getUserRatings = async (userId) => {
  try {
    // First get the ratings
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('rated_id', userId)
      .order('created_at', { ascending: false });
      
    if (ratingsError) throw ratingsError;
    
    if (!ratingsData || ratingsData.length === 0) return [];
    
    // Then get the rater profiles
    const raterIds = ratingsData.map(rating => rating.rater_id);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, title')
      .in('id', raterIds);
      
    if (profilesError) throw profilesError;
    
    // Combine the data
    const ratingsWithProfiles = ratingsData.map(rating => {
      const raterProfile = profilesData.find(profile => profile.id === rating.rater_id);
      return {
        ...rating,
        rater: raterProfile
      };
    });
    
    return ratingsWithProfiles;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return [];
  }
};

/**
 * Delete a rating
 * @param {string} ratingId - The ID of the rating to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteRating = async (ratingId) => {
  try {
    const { error } = await supabase
      .from('user_ratings')
      .delete()
      .eq('id', ratingId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting rating:', error);
    return false;
  }
};

/**
 * Check if two users have exchanged messages (required before rating)
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<boolean>} - Whether they've exchanged messages
 */
export const haveExchangedMessages = async (userId1, userId2) => {
  try {
    // Check if userId1 has sent messages to userId2
    const { data: messages1, error: error1 } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', userId1)
      .eq('recipient_id', userId2)
      .limit(1);
      
    if (error1) throw error1;
    
    // Check if userId2 has sent messages to userId1
    const { data: messages2, error: error2 } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', userId2)
      .eq('recipient_id', userId1)
      .limit(1);
      
    if (error2) throw error2;
    
    // Return true if both have exchanged at least one message
    return messages1.length > 0 && messages2.length > 0;
  } catch (error) {
    console.error('Error checking message exchange:', error);
    return false;
  }
};

// Safely increment post view count
export const viewPost = async (postId) => {
  if (!postId) return { success: false };
  
  try {
    // Try to call the RPC function to increment views
    await supabase.rpc('increment_post_views', { post_id: postId });
    return { success: true };
  } catch (error) {
    console.warn('Failed to increment post view count:', error);
    
    // Try a fallback direct update
    try {
      const { data: post } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single();
      
      if (post) {
        const newViewCount = (post.view_count || 0) + 1;
        await supabase
          .from('posts')
          .update({ view_count: newViewCount })
          .eq('id', postId);
      }
      
      return { success: true };
    } catch (fallbackError) {
      console.warn('Fallback view count increment also failed:', fallbackError);
      return { success: false, error: fallbackError };
    }
  }
};