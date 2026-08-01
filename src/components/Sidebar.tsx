import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Bug,
  FolderUp,
  ShieldAlert,
  Zap,
  TestTube2,
  MessageSquareCode,
  History,
  Github,
  Code2,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'analyze', label: 'Analyze & Fix Bug', icon: Bug, badge: 'Core' },
    { id: 'upload', label: 'Upload Project / Zip', icon: FolderUp, badge: null },
    { id: 'security', label: 'Security Scan', icon: ShieldAlert, badge: 'OWASP' },
    { id: 'optimize', label: 'Code Optimizer', icon: Zap, badge: 'Perf' },
    { id: 'tests', label: 'Unit Test Generator', icon: TestTube2, badge: null },
    { id: 'chat', label: 'AI Debug Chat', icon: MessageSquareCode, badge: 'Live' },
    { id: 'history', label: 'History & Logs', icon: History, badge: null },
    { id: 'github', label: 'GitHub Import', icon: Github, badge: 'API' },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between">
      <div className="p-4 space-y-4">
        {/* Navigation Category Label */}
        <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Navigation
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / User Account Panel */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-indigo-400">{user?.name ? user.name[0].toUpperCase() : 'AI'}</span>
            )}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name || 'Guest Engineer'}</p>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400 inline" />
              <span>Gemini 3.6 Flash</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

