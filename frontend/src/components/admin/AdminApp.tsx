import React from 'react';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminProtectedRoute } from './auth/AdminProtectedRoute';
import { AdminRouter } from './AdminRouter';

export const AdminApp: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminProtectedRoute>
        <AdminRouter />
      </AdminProtectedRoute>
    </AdminAuthProvider>
  );
};
