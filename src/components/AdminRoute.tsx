import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuth();

  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  // Check if user is logged in and is an admin
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if the user is an admin
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If user is admin, render the children
  return <>{children}</>;
};

export default AdminRoute; 