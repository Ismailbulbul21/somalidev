import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient.js';
import PageLoader from '../components/ui/PageLoader';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/signin?error=auth-callback-failed');
        return;
      }

      if (session) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Check if account_type exists in user metadata
        const accountType = session.user.user_metadata?.account_type;
        const isNewUser = !profile;

        if (isNewUser) {
          // Create profile for new Google users
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                full_name: session.user.user_metadata.full_name || session.user.user_metadata.name,
                avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
                email: session.user.email,
              },
            ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }

          // If new user or no account type, redirect to complete profile page
          if (!accountType) {
            navigate('/complete-profile');
            return;
          }
        }

        // If existing user without account type, also redirect to complete profile
        if (!accountType) {
          navigate('/complete-profile');
        } else {
          // User has a complete profile, redirect to home
          navigate('/');
        }
      } else {
        navigate('/signin');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <PageLoader message="Completing authentication..." />;
};

export default AuthCallback; 