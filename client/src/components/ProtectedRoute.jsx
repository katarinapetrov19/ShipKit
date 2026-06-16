import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Route guard to restrict access to authenticated users only.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          <p className="text-sm font-semibold text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page while preserving state
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Route guard to restrict access to administrators only.
 */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          <p className="text-sm font-semibold text-slate-600">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    // Non-admins get redirected to standard dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
