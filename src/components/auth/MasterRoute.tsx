import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

interface MasterRouteProps {
    children: React.ReactNode;
}

const MasterRoute: React.FC<MasterRouteProps> = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'Master') {
        // Redirect to admin dashboard or a "not authorized" page if they are logged in but not a Master
        // For now, redirecting to /admin seems safe as it's the base protected route, 
        // but if they are not master, maybe they shouldn't be in /admin at all?
        // Wait, /admin is for both Master and Vendor?
        // App.tsx: /admin is protected by ProtectedRoute.
        // Inside /admin, there are routes for vendors and admins.
        // MasterRoute protects specific sub-routes like /admin/vendors and /admin/admins.
        // So if a Vendor tries to access /admin/vendors, they should probably be redirected to /admin (their dashboard).
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

export default MasterRoute;
