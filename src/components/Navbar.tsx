import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bug,
  Github,
  Sun,
  Moon,
  Keyboard,
  User as UserIcon,
  LogOut,
  Sparkles,
  Command,
  Search,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenShortcuts: () => void;
  onOpenGithub: () => void;
  onSearchQueryChange?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenShortcuts,
  onOpenGithub,
}) => {
  const { user, logout, theme, toggleTheme, activeTab, setActiveTab } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/30 backdrop-blur-xl transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Left Brand Area */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-sans">AI Bug Fix</span>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 hidden sm:inline-block">
                v2.5
              </span>
            </div>
          </button>
        </div>

        {/* Center Breadcrumb Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Workspace</span>
          <span className="text-slate-700">/</span>
          <span className="text-indigo-400 font-medium capitalize">{activeTab.replace('_', ' ')}</span>
        </div>

        {/* Center Quick Navigation / Command Palette Launcher */}
        <div className="hidden md:flex items-center gap-2 max-w-xs w-full mx-4">
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 text-xs hover:border-slate-700 hover:text-slate-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">Search commands...</span>
            </span>
            <kbd className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right Actions & User Menu */}
        <div className="flex items-center gap-3">
          {/* GitHub Import */}
          <button
            onClick={onOpenGithub}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-800 hover:text-white transition-all"
            title="Import GitHub Repo or PR"
          >
            <Github className="w-4 h-4 text-slate-400" />
            <span>GitHub</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pr-2 rounded-lg border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-slate-800"
                />
                <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate hidden sm:inline">
                  {user.name}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>User Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
