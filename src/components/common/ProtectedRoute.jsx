import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route protection by role
 * @param {Array<string>} allowedRoles e.g. ['admin'], ['theatre'], ['user']
 * @param {string} forbiddenMessage Custom access denied message for redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [], forbiddenMessage = '' }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cine-950">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to unified /login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = (user?.role || '').toLowerCase().trim();
  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase().trim());

  // If specific roles are required, verify database role
  if (allowedRoles.length > 0 && !normalizedAllowed.includes(currentRole)) {
    // If admin attempts customer-only booking page
    if (currentRole === 'admin') {
      return (
        <Navigate
          to="/admin/dashboard"
          state={{
            accessDeniedMessage:
              forbiddenMessage ||
              'Admins are not allowed to book movie tickets. Please use a customer account.',
          }}
          replace
        />
      );
    }

    // If theatre staff attempts other pages
    if (currentRole === 'theatre') {
      return (
        <Navigate
          to="/theatre/dashboard"
          state={{
            accessDeniedMessage:
              forbiddenMessage ||
              'Theatre accounts are restricted to theatre management pages.',
          }}
          replace
        />
      );
    }

    // If ordinary user attempts to access admin
    if (currentRole === 'user') {
      return (
        <Navigate
          to="/"
          state={{
            accessDeniedMessage:
              forbiddenMessage ||
              'Access denied. Administrator privileges are required to access management pages.',
          }}
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        state={{
          accessDeniedMessage: forbiddenMessage || 'Access restricted for your current account role.',
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
