import { supabase } from './supabaseClient.jsx';
import { convertCategoryId } from './categoryUtils.js';

// Fixed implementation of getPosts function
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
            try {
                // First check if there are any posts with category IDs at all
                const { data: categorizedPosts, error: catCheckError } = await supabase
                    .from('posts')
                    .select('id')
                    .not('category_id', 'is', null)
                    .limit(1);

                // If no posts have categories assigned, modify our approach
                if (!catCheckError && (!categorizedPosts || categorizedPosts.length === 0)) {
                    console.log('No posts with assigned categories found in database');

                    // Get all the posts first to filter manually if needed
                    const { data: allPosts } = await supabase
                        .from('posts')
                        .select('*')
                        .order('created_at', { ascending: false });

                    console.log(`Retrieved ${allPosts?.length || 0} posts for manual filtering`);

                    // Since no posts have categories, resort to matching against post content or title
                    // Get the proper name from the category ID
                    let categoryName = '';

                    try {
                        if (category.includes('-')) {
                            // Handle kebab-case category IDs like 'web-dev'
                            categoryName = category.replace(/-/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                        } else {
                            // Try to find the matching category from database to get its proper name
                            const { data: categoryData } = await supabase
                                .from('categories')
                                .select('name')
                                .eq('id', category)
                                .single();

                            if (categoryData && categoryData.name) {
                                categoryName = categoryData.name;
                            }
                        }
                    } catch (err) {
                        console.error('Error getting category name:', err);
                    }

                    if (!categoryName) {
                        categoryName = category; // Fallback to using the raw category ID if all else fails
                    }

                    console.log(`Using category name for manual filtering: "${categoryName}"`);

                    // Create relevant keywords based on the category
                    const keywordMap = {
                        'Web Development': ['web', 'website', 'frontend', 'backend', 'javascript', 'html', 'css', 'react', 'vue', 'angular'],
                        'Mobile Development': ['mobile', 'app', 'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin'],
                        'UI/UX Design': ['design', 'ui', 'ux', 'user interface', 'user experience', 'figma', 'sketch'],
                        'Data Science': ['data', 'analytics', 'visualization', 'statistics', 'pandas', 'jupyter'],
                        'Machine Learning': ['ml', 'ai', 'artificial intelligence', 'model', 'neural', 'tensorflow', 'pytorch'],
                        'Game Development': ['game', 'unity', 'unreal', 'gaming', '3d', 'simulation'],
                        'Cybersecurity': ['security', 'cyber', 'hacking', 'encryption', 'firewall', 'protection']
                    };

                    // Get keywords for the selected category
                    const keywords = keywordMap[categoryName] || [];
                    console.log(`Keywords for "${categoryName}": ${keywords.join(', ')}`);

                    if (keywords.length > 0) {
                        // For keywords, use a proper OR filter
                        let keywordQuery = query;
                        keywords.forEach((keyword, index) => {
                            if (index === 0) {
                                // First condition needs to be in an or filter
                                keywordQuery = keywordQuery.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
                            } else {
                                // Subsequent conditions need to be chained
                                keywordQuery = keywordQuery.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
                            }
                        });
                        query = keywordQuery;
                        console.log('Using keyword-based search with multiple conditions');
                    } else {
                        // If no specific keywords, do a simple search with the category name
                        query = query.or(`title.ilike.%${categoryName}%,content.ilike.%${categoryName}%`);
                        console.log(`Using basic content search for: ${categoryName}`);
                    }

                    // Skip the rest of the category filtering logic since we're using content-based approach
                } else {
                // Convert fallback category ID to database ID if needed
                const dbCategoryId = await convertCategoryId(category);
                console.log(`Category ID conversion: ${category} -> ${dbCategoryId}`);

                    // Create a formatted category name from the original category ID regardless of conversion result
                    const categoryName = category.replace(/-/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                    // If we have a valid UUID from conversion, use it for direct ID matching
                    if (dbCategoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbCategoryId)) {
                        console.log(`Using direct UUID match with category_id: ${dbCategoryId}`);
                        // Use direct equals for category_id and ilike for category_name
                        query = query.eq('category_id', dbCategoryId);
                } else {
                        // If no valid UUID, fallback to name-based filtering only
                        console.log(`Using name-based filter with: ${categoryName}`);
                        query = query.ilike('category_name', `%${categoryName}%`);

                        // Also try to directly fetch all posts to ensure we're not missing anything
                        const { data: allPosts } = await supabase
                            .from('posts')
                            .select('id')
                            .order('created_at', { ascending: false })
                            .limit(pageSize * 2);  // Get some extra to ensure we have enough after filtering

                        if (allPosts && allPosts.length > 0) {
                            console.log(`Fetched ${allPosts.length} posts to check manually`);
                            // If there are posts in the database, just don't filter by category
                            // This ensures the user sees posts when category filtering fails
                            // query = query; // No need to modify the query, just not adding category filter
                        }
                    }
                }
            } catch (error) {
                // If conversion fails, fallback to name-based filtering
                console.error('Error in category conversion:', error);

                // Safely create a category name for filtering
                try {
                    const categoryName = category.replace(/-/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                    console.log(`Using fallback name filter due to error: ${categoryName}`);
                    query = query.ilike('category_name', `%${categoryName}%`);
                } catch (nameError) {
                    // If even name conversion fails, just return all posts
                    console.error('Name conversion also failed:', nameError);
                    // Not adding any category filter
                }
            }
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

        console.log('Final query:', query);

        // Execute query
        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }

        console.log(`Found ${data?.length || 0} posts out of ${count || 0} total`);

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