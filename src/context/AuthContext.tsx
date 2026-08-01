import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ToastMessage } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aibugfix_token'));
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('aibugfix_theme') as 'dark' | 'light') || 'dark'
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    // Sync theme class to html element
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('aibugfix_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      api.getMe(token)
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('aibugfix_token');
          setToken(null);
          setUser(null);
        });
    }
  }, [token]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('aibugfix_token', newToken);
    setToken(newToken);
    setUser(newUser);
    addToast('success', 'Welcome back!', `Logged in as ${newUser.name}`);
  };

  const logout = () => {
    localStorage.removeItem('aibugfix_token');
    setToken(null);
    setUser(null);
    addToast('info', 'Logged out', 'You have been logged out.');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        login,
        logout,
        updateUser,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
