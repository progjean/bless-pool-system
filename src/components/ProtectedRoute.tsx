import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirecionar baseado no papel do usuário
    switch (user.role) {
      case UserRole.ADMIN:
        return <Navigate to="/admin-hub" replace />;
      case UserRole.SUPERVISOR:
        return <Navigate to="/supervisor-selector" replace />;
      case UserRole.TECHNICIAN:
        return <Navigate to="/work" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

