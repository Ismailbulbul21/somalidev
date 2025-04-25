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

// Community Posts Functions

// Get all posts with pagination, filtering and sorting
export const getPosts = async ({
  page = 1,
  pageSize = 10,
  category = null,
  postType = null,
  search = null,
  sortBy = 'created_at',
  sortOrder = 'desc',
}) => {
  try {
    console.log('Fetching posts with params:', { page, pageSize, category, postType, search, sortBy, sortOrder });
    
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Start with the base query
    let query = supabase
      .from('post_feed')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (postType) {
      query = query.eq('post_type', postType);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
    
    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    console.error('Exception in getPosts:', error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }
};

// Get a single post by ID with all associated data
export const getPost = async (postId) => {
  try {
    if (!postId) throw new Error('Post ID is required');
    
    // Increment view count
    await supabase.rpc('increment_post_views', { post_id: postId });
    
    // Get the post details
    const { data, error } = await supabase
      .from('post_feed')
      .select('*')
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
    
    return {
      ...data,
      comments: comments || []
    };
  } catch (error) {
    console.error('Exception in getPost:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (post) => {
  try {
    console.log('createPost received:', post);
    
    // Handle FormData objects
    let postData = {};
    
    if (post instanceof FormData) {
      // Extract data from FormData
      console.log('Post is FormData, extracting values...');
      postData = {
        title: post.get('title'),
        content: post.get('content'),
        post_type: post.get('post_type'),
        category_id: post.get('category_id')
      };
      
      // Handle tags if present
      const tags = post.get('tags');
      if (tags) {
        try {
          postData.tags = JSON.parse(tags);
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }
      
      // Log the extracted data
      console.log('Extracted data from FormData:', postData);
    } else {
      // If not FormData, use as is
      postData = { ...post };
    }
    
    // Validate required fields
    if (!postData.title) throw new Error('Post title is required');
    if (!postData.content) throw new Error('Post content is required');
    if (!postData.post_type) throw new Error('Post type is required');
    
    // Check if category_id is a non-UUID string (from our fallback categories)
    if (postData.category_id && !postData.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('Using a non-UUID category ID, setting to null for database compatibility');
      postData.category_id = null; // Set to null to avoid database constraint errors
    }
    
    // Insert the post
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in createPost:', error);
    throw error;
  }
};

// Update an existing post
export const updatePost = async (postId, updates) => {
  try {
    if (!postId) throw new Error('Post ID is required');
    
    console.log('updatePost received:', { postId, updates });
    
    // Handle FormData objects
    let updateData = {};
    
    if (updates instanceof FormData) {
      // Extract data from FormData
      console.log('Updates is FormData, extracting values...');
      updateData = {
        title: updates.get('title'),
        content: updates.get('content'),
        post_type: updates.get('post_type'),
        category_id: updates.get('category_id')
      };
      
      // Handle tags if present
      const tags = updates.get('tags');
      if (tags) {
        try {
          updateData.tags = JSON.parse(tags);
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
      
      // Log the extracted data
      console.log('Extracted data from FormData:', updateData);
    } else {
      // If not FormData, use as is
      updateData = { ...updates };
    }
    
    // Update the post
    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating post:', error);
      throw error;
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
    const url = getImageUrl('post-media', filePath);
    
    // Add entry to post_media table
    const { data, error } = await supabase
      .from('post_media')
      .insert([{
        post_id: postId,
        url,
        media_type: mediaType
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding post media record:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in addPostMedia:', error);
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