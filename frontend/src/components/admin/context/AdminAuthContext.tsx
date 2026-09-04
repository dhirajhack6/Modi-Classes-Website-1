import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '../adminTypes';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  isForbidden: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const getStoredToken = () => localStorage.getItem('modi_admin_token');

  const checkAuth = async () => {
    setIsLoading(true);
    setIsForbidden(false);
    setAuthError(null);

    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('/api/admin/auth/me', {
        headers,
        credentials: 'include'
      });

      if (res.status === 403) {
        setIsForbidden(true);
        setAdminUser(null);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.role === 'admin') {
          setAdminUser(data.user);
          setIsForbidden(false);
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      console.error('Error checking admin auth:', err);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    setIsForbidden(false);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success && data.user?.role === 'admin') {
        if (data.token) {
          localStorage.setItem('modi_admin_token', data.token);
        }
        setAdminUser(data.user);
        setIsForbidden(false);
        return { success: true };
      } else if (res.status === 403) {
        setIsForbidden(true);
        const err = data.error || 'Forbidden: You do not have administrative access.';
        setAuthError(err);
        return { success: false, error: err };
      } else {
        const err = data.error || 'Invalid admin credentials.';
        setAuthError(err);
        return { success: false, error: err };
      }
    } catch (err) {
      setIsLoading(false);
      const errMessage = 'Network error connecting to administration server.';
      setAuthError(errMessage);
      return { success: false, error: errMessage };
    }
  };

  const logout = async () => {
    const token = getStoredToken();
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error logging out admin:', err);
    } finally {
      localStorage.removeItem('modi_admin_token');
      setAdminUser(null);
      setIsForbidden(false);
      window.location.pathname = '/admin';
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminLoggedIn: Boolean(adminUser && adminUser.role === 'admin'),
        isLoading,
        isForbidden,
        authError,
        login,
        logout,
        checkAuth,
        clearError
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
