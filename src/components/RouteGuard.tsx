
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type RouteGuardProps = {
  redirectTo?: string;
};

export const RouteGuard = ({ redirectTo = '/login' }: RouteGuardProps) => {
  const { user, isLoading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If user is authenticated, render the protected route
  return <Outlet />;
};

export default RouteGuard;
