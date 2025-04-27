import { supabase } from './supabaseClient.jsx';

// Function to get fallback categories
export const getFallbackCategories = () => {
    return [
        { id: 'web-dev', name: 'Web Development', description: 'Development of websites and web applications' },
        { id: 'mobile-dev', name: 'Mobile Development', description: 'Development of applications for mobile devices' },
        { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and user experience design' },
        { id: 'data-science', name: 'Data Science', description: 'Analysis and interpretation of complex data' },
        { id: 'ml-ai', name: 'Machine Learning', description: 'Artificial intelligence and machine learning' },
        { id: 'game-dev', name: 'Game Development', description: 'Development of video games and interactive applications' },
        { id: 'cybersecurity', name: 'Cybersecurity', description: 'Protection of systems, networks, and programs from digital attacks' },
    ];
};

// Improved get categories function
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

        // Handle error case
        if (response.error) {
            console.error('Error fetching categories:', response.error);
            console.log('Returning fallback categories due to error');
            return getFallbackCategories();
        }

        // If no data returned or empty array, return fallback categories
        if (!response.data || response.data.length === 0) {
            console.log('No categories found in database, returning fallback categories');
            return getFallbackCategories();
        }

        console.log('Successfully fetched categories from database:', response.data);
        return response.data;

    } catch (error) {
        console.error('Exception in getCategories:', error);
        return getFallbackCategories();
    }
};

// Function to create a map between fallback IDs and database IDs
export const getCategoryIdMap = (categoriesFromDb) => {
    console.log('Creating category ID map');
    const fallbackCategories = getFallbackCategories();
    const idMap = {};

    // Map from fallback IDs to database IDs
    fallbackCategories.forEach(fallback => {
        console.log(`Looking for match for fallback category: ${fallback.name}`);

        // Try exact match first
        let matchingDbCategory = categoriesFromDb.find(
            dbCat => dbCat.name.toLowerCase() === fallback.name.toLowerCase()
        );

        // If no exact match, try partial match
        if (!matchingDbCategory) {
            matchingDbCategory = categoriesFromDb.find(
                dbCat => dbCat.name.toLowerCase().includes(fallback.name.toLowerCase()) ||
                    fallback.name.toLowerCase().includes(dbCat.name.toLowerCase())
            );
        }

        // If still no match, try matching by description
        if (!matchingDbCategory) {
            matchingDbCategory = categoriesFromDb.find(
                dbCat => dbCat.description && fallback.description &&
                    (dbCat.description.toLowerCase().includes(fallback.description.toLowerCase()) ||
                        fallback.description.toLowerCase().includes(dbCat.description.toLowerCase()))
            );
        }

        if (matchingDbCategory) {
            console.log(`Found matching database category: ${matchingDbCategory.name} (${matchingDbCategory.id})`);
            idMap[fallback.id] = matchingDbCategory.id;
        } else {
            console.log(`No matching database category found for: ${fallback.name}`);
        }
    });

    console.log('Final category ID map:', idMap);
    return idMap;
};

// Function to convert between fallback ID and database ID
export const convertCategoryId = async (categoryId) => {
    console.log('Converting category ID:', categoryId);

    // If no categoryId provided, return null
    if (!categoryId) {
        console.log('No category ID provided');
        return null;
    }

    try {
        // If it's already a UUID, validate and return as is
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)) {
            console.log('ID is already a UUID, validating existence...');

            // Validate that this UUID exists in the database
            const { data: categoryExists } = await supabase
                .from('categories')
                .select('id, name')
                .eq('id', categoryId)
                .single();

            if (categoryExists) {
                console.log(`UUID exists in database: ${categoryExists.name} (${categoryExists.id})`);
                return categoryId;
            }
            console.log('UUID not found in database, will attempt to find matching category');
        }

        // Standardize the input for name-based lookups
        const normalizedName = categoryId.replace(/-/g, ' ').toLowerCase();
        console.log(`Looking for category with normalized name: "${normalizedName}"`);

        // First direct method - lookup by similar name
        const { data: nameMatches } = await supabase
            .from('categories')
            .select('id, name')
            .or(`name.ilike.%${normalizedName}%,slug.ilike.%${normalizedName}%`)
            .order('name', { ascending: true });

        if (nameMatches && nameMatches.length > 0) {
            console.log(`Found ${nameMatches.length} categories matching "${normalizedName}"`);

            // First try exact name match
            const exactMatch = nameMatches.find(
                cat => cat.name.toLowerCase() === normalizedName
            );

            if (exactMatch) {
                console.log(`Found exact match: ${exactMatch.name} (${exactMatch.id})`);
                return exactMatch.id;
            }

            // Then try contains match
            const containsMatch = nameMatches.find(
                cat => cat.name.toLowerCase().includes(normalizedName) ||
                    normalizedName.includes(cat.name.toLowerCase())
            );

            if (containsMatch) {
                console.log(`Found contains match: ${containsMatch.name} (${containsMatch.id})`);
                return containsMatch.id;
            }

            // Otherwise just return the first match
            console.log(`Using first match: ${nameMatches[0].name} (${nameMatches[0].id})`);
            return nameMatches[0].id;
        }

        // If all else fails, get the first available category
        const { data: anyCategory } = await supabase
            .from('categories')
            .select('id, name')
            .limit(1)
            .single();

        if (anyCategory) {
            console.log(`No matches found, using first available category: ${anyCategory.name} (${anyCategory.id})`);
            return anyCategory.id;
        }

        // If no categories at all (empty database?), return original
        console.log('No categories found in database, returning original');
        return categoryId;

    } catch (error) {
        console.error('Error converting category ID:', error);

        // Last resort query - get any category
        try {
            const { data: fallback } = await supabase
                .from('categories')
                .select('id, name')
                .limit(1);

            if (fallback && fallback.length > 0) {
                console.log(`Using fallback category: ${fallback[0].name} (${fallback[0].id})`);
                return fallback[0].id;
            }
        } catch (innerError) {
            console.error('Error in fallback category lookup:', innerError);
        }

        // If all else fails, return original
        return categoryId;
    }
};

// Function to sync existing posts with correct category IDs
export const syncPostCategories = async () => {
    try {
        // Call the database function to sync categories
        const { data, error } = await supabase.rpc('sync_categories');

        if (error) {
            console.error('Error syncing categories from database function:', error);
            return { success: false, error: error.message };
        }

        console.log('Sync result from database function:', data);

        return {
            success: data.success,
            updatedCount: data.updated_count || 0
        };
    } catch (error) {
        console.error('Error syncing post categories:', error);
        return { success: false, error: error.message };
    }
}; 