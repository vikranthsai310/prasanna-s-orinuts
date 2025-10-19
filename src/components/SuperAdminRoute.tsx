import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SuperAdminRouteProps {
  children: ReactNode;
}

const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
  const { user, isLoading } = useAuth();

  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if the user is a Super Admin (not just regular admin)
  if (!user.isAdmin || user.adminRole !== 'super-admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If user is Super Admin, render the children
  return <>{children}</>;
};

export default SuperAdminRoute;
