import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/ToastContainer';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CodeAnalyzer } from './components/CodeAnalyzer';
import { AnalysisResults } from './components/AnalysisResults';
import { SecurityScannerView } from './components/SecurityScannerView';
import { CodeOptimizerView } from './components/CodeOptimizerView';
import { UnitTestGeneratorView } from './components/UnitTestGeneratorView';
import { ProjectUploader } from './components/ProjectUploader';
import { DebugHistoryView } from './components/DebugHistoryView';
import { GitHubImportModal } from './components/GitHubImportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AnalysisResult, HistoryItem } from './types';

function MainApp() {
  const { activeTab, setActiveTab } = useAuth();

  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);

  // Prefill state for CodeAnalyzer
  const [analyzerCode, setAnalyzerCode] = useState('');
  const [analyzerError, setAnalyzerError] = useState('');
  const [analyzerLang, setAnalyzerLang] = useState('auto');

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);

  // Global Keyboard Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowAuthModal(false);
        setShowProfileModal(false);
        setShowShortcutsModal(false);
        setShowGithubModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickPreset = (code: string, errorLog: string, language: string) => {
    setAnalyzerCode(code);
    setAnalyzerError(errorLog);
    setAnalyzerLang(language);
    setActiveResult(null);
    setActiveTab('analyze');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setActiveResult(result);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.result) {
      setActiveResult(item.result);
      setActiveTab('analyze');
    }
  };

  const handleGitHubFileSelect = (code: string, fileName: string, language: string) => {
    setAnalyzerCode(code);
    setAnalyzerError('');
    setAnalyzerLang(language);
    setActiveResult(null);
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      <ToastContainer />

      {/* Navbar Header */}
      <Navbar
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onOpenGithub={() => setShowGithubModal(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard onQuickPreset={handleQuickPreset} />
          )}

          {activeTab === 'analyze' && (
            <>
              {activeResult ? (
                <AnalysisResults
                  result={activeResult}
                  onReset={() => {
                    setActiveResult(null);
                    setAnalyzerCode('');
                    setAnalyzerError('');
                  }}
                />
              ) : (
                <CodeAnalyzer
                  initialCode={analyzerCode}
                  initialError={analyzerError}
                  initialLang={analyzerLang}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              )}
            </>
          )}

          {activeTab === 'upload' && (
            <ProjectUploader
              onAnalyzeFile={(code, fileName, language) => {
                setAnalyzerCode(code);
                setAnalyzerError('');
                setAnalyzerLang(language);
                setActiveResult(null);
                setActiveTab('analyze');
              }}
            />
          )}

          {activeTab === 'security' && <SecurityScannerView />}

          {activeTab === 'optimize' && <CodeOptimizerView />}

          {activeTab === 'tests' && <UnitTestGeneratorView />}

          {activeTab === 'chat' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">Interactive AI Debug Chat</h2>
              <p className="text-xs text-slate-400">
                Run an analysis in the Analyze Code tab to launch the live contextual assistant thread, or start a new bug repair session above.
              </p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                Go to Analyzer
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <DebugHistoryView onSelectHistoryItem={handleSelectHistoryItem} />
          )}

          {activeTab === 'github' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <h2 className="text-sm font-bold font-mono text-slate-100">GitHub Repository & PR Analyzer</h2>
              <p className="text-xs text-slate-400">Import files directly from any public GitHub repository.</p>
              <button
                onClick={() => setShowGithubModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                Launch GitHub Importer Modal
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <GitHubImportModal
        isOpen={showGithubModal}
        onClose={() => setShowGithubModal(false)}
        onSelectFileToAnalyze={handleGitHubFileSelect}
      />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
