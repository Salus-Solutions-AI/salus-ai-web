import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { profilesApi } from '@/api/resources/profiles';
import { organizationsApi } from '@/api/resources/organizations';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, organization: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfile = async (userId: string) => {
    if (!session || isSigningUp) {
      return;
    }
    try {
      const profile = await profilesApi.getById(session, userId);
      setProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const setupSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
  
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error setting up session:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    setupSession();
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle email confirmation sign-in
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await profilesApi.getById(session, session.user.id);
          } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
              await profilesApi.create(session, {
                id: session.user.id,
                fullName: session.user.user_metadata.full_name || '',
                organization: session.user.user_metadata.organization || '',
              });

              toast({
                title: "Welcome!",
                description: "Your email has been confirmed and account is ready.",
                variant: "success",
              });
            } else {
              console.error('Error creating profile:', error);
              toast({
                title: "Profile setup failed",
                description: "Please contact support if this persists.",
                variant: "destructive",
              });
            }
          }

          navigate('/');
        }
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );
  
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (user) {
      refetchProfile();
    }
  }, [location.pathname, user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      try {
        await profilesApi.create(data.session, { 
          id: data.user?.id,
          fullName: data.user?.user_metadata.full_name,
          organization: data.user?.user_metadata.organization,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('409')) {
          console.error('Profile already exists:', error);
        } else {
          throw error;
        }
      }

      navigate('/');
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, organization: string) => {
    setIsSigningUp(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            organization: organization,
          },
        },
      });
      
      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
        variant: "success",
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSigningUp(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      navigate('/');
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message || "An error occurred while sending the reset email.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refetchProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
