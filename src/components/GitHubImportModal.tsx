import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectFile } from '../types';
import { Github, X, Sparkles, FileCode, ArrowRight, Bug } from 'lucide-react';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFileToAnalyze: (code: string, fileName: string, language: string) => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  onSelectFileToAnalyze,
}) => {
  const { addToast } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<{ owner: string; repo: string; files: ProjectFile[] } | null>(null);

  if (!isOpen) return null;

  const handleFetchRepo = async () => {
    if (!repoUrl.trim()) {
      addToast('warning', 'URL Required', 'Please enter a public GitHub repository link.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.fetchGitHubRepo(repoUrl);
      setFetchedData(data);
      addToast('success', 'GitHub Imported', `Fetched ${data.files?.length || 0} source files from ${data.owner}/${data.repo}`);
    } catch (err: any) {
      addToast('error', 'Import Failed', err.message || 'Could not fetch repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono">Import GitHub Repository or PR</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Enter a public GitHub repository link (e.g. <code className="text-indigo-300 font-mono">https://github.com/expressjs/express</code>) to fetch and analyze files.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            onClick={handleFetchRepo}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <span>Fetch Repo</span>}
          </button>
        </div>

        {fetchedData && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span>Repository: <strong className="text-cyan-400">{fetchedData.owner}/{fetchedData.repo}</strong></span>
              <span>{fetchedData.files.length} Code Files</span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {fetchedData.files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-slate-200 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectFileToAnalyze(file.content, file.name, file.language);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold shrink-0 ml-2"
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Analyze</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
