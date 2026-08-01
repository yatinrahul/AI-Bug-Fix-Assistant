import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HistoryItem } from '../types';
import {
  Bug,
  FolderUp,
  ShieldAlert,
  Zap,
  TestTube2,
  MessageSquareCode,
  History,
  Github,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileCode2,
  Flame,
  Terminal,
} from 'lucide-react';

interface DashboardProps {
  onQuickPreset: (code: string, errorLog: string, language: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onQuickPreset }) => {
  const { setActiveTab } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    api
      .getHistory()
      .then((data) => {
        setHistory(data);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, []);

  const mainFeatureCards = [
    {
      id: 'analyze',
      title: 'Analyze Code',
      desc: 'Paste code or error tracebacks to detect root cause & get corrected fix.',
      icon: Bug,
      color: 'from-cyan-500/20 to-indigo-500/20 text-cyan-400 border-cyan-500/30',
      tag: 'Most Popular',
    },
    {
      id: 'upload',
      title: 'Upload Project / Zip',
      desc: 'Upload entire code archives or multiple files for full workspace analysis.',
      icon: FolderUp,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
      tag: '.ZIP Support',
    },
    {
      id: 'security',
      title: 'Security Scanner',
      desc: 'Audit code for OWASP Top 10 vulnerabilities, API keys & injection flaws.',
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-amber-500/20 text-rose-400 border-rose-500/30',
      tag: 'OWASP Audit',
    },
    {
      id: 'optimize',
      title: 'Optimize Code',
      desc: 'Improve execution speed, memory footprint & readability with Big-O metrics.',
      icon: Zap,
      color: 'from-amber-500/20 to-emerald-500/20 text-amber-400 border-amber-500/30',
      tag: 'Performance',
    },
    {
      id: 'tests',
      title: 'Generate Unit Tests',
      desc: 'Instantly produce PyTest, Jest, JUnit or Vitest suites with edge coverage.',
      icon: TestTube2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      tag: 'Automated QA',
    },
    {
      id: 'chat',
      title: 'AI Debug Assistant',
      desc: 'Interactive chat session to discuss bug fixes, refactoring, and concepts.',
      icon: MessageSquareCode,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      tag: 'Context Aware',
    },
    {
      id: 'history',
      title: 'Debug History',
      desc: 'Search, filter, bookmark, and review past debugging sessions & fixes.',
      icon: History,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
      tag: 'Searchable',
    },
    {
      id: 'github',
      title: 'GitHub Repo Import',
      desc: 'Import public GitHub repositories or Pull Requests to analyze live code.',
      icon: Github,
      color: 'from-slate-500/20 to-indigo-500/20 text-slate-300 border-slate-500/30',
      tag: 'Live Repo',
    },
  ];

  const presets = [
    {
      name: 'Python KeyError & Traceback',
      lang: 'python',
      code: `def process_user(data):\n    user_name = data['name']\n    user_age = data['age']\n    return f"{user_name} is {user_age} years old"\n\nprint(process_user({'name': 'Alice'}))`,
      error: `Traceback (most recent call last):\n  File "main.py", line 6, in <module>\n    print(process_user({'name': 'Alice'}))\n  File "main.py", line 3, in process_user\n    user_age = data['age']\nKeyError: 'age'`,
    },
    {
      name: 'React Infinite Loop / Effect Dependency',
      lang: 'jsx',
      code: `import React, { useState, useEffect } from 'react';\n\nexport default function UserProfile() {\n  const [user, setUser] = useState({ name: 'Bob', count: 0 });\n\n  useEffect(() => {\n    setUser({ name: 'Bob', count: user.count + 1 });\n  }, [user]);\n\n  return <div>Count: {user.count}</div>;\n}`,
      error: `Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.`,
    },
    {
      name: 'Java NullPointerException',
      lang: 'java',
      code: `public class OrderProcessor {\n    public static void main(String[] args) {\n        String customerName = getCustomerName(101);\n        System.out.println("Customer length: " + customerName.length());\n    }\n\n    public static String getCustomerName(int id) {\n        return null; // Simulated missing record\n    }\n}`,
      error: `Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "customerName" is null\n\tat OrderProcessor.main(OrderProcessor.java:4)`,
    },
    {
      name: 'SQL Injection Vulnerability',
      lang: 'sql',
      code: `SELECT * FROM users WHERE username = '` + `' + input_username + '` + `' AND password = '` + `' + input_password + '` + `'`,
      error: `Security Audit Warning: Dynamic string concatenation detected in SQL query string allowing raw injection ' OR '1'='1`,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Bug Fix Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Solve Programming Errors & Vulnerabilities in Seconds
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Paste error logs, upload project files, or import GitHub repositories. Powered by Gemini reasoning to pinpoint root causes, generate clean fixes, audit OWASP security, and write unit tests.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('analyze')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Bug className="w-4 h-4" />
              <span>Start Debugging Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold transition-all"
            >
              <FolderUp className="w-4 h-4 text-slate-400" />
              <span>Upload Zip Project</span>
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Feature Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-400 font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Core Capabilities</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainFeatureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-br ${card.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {card.tag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {card.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-indigo-300 font-medium">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Bug Example Presets */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Try Sample Bug Scenarios
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Click any preset to pre-fill the AI code analyzer with common bugs and tracebacks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                onQuickPreset(preset.code, preset.error, preset.lang);
                setActiveTab('analyze');
              }}
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-indigo-500/40 hover:bg-slate-900 text-left transition-all group"
            >
              <FileCode2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                  {preset.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                  {preset.error.split('\n')[0]}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Debug History Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Recent Debug Sessions</span>
          </h3>
          {history.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All ({history.length})
            </button>
          )}
        </div>

        {loadingHistory ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading recent history...</div>
        ) : history.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No debug sessions recorded yet. Analyze your first bug to save history here.
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab('history')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold uppercase">
                    {item.language.substring(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.bugSummary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.severity === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.severity === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
