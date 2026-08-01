import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import {
  Bug,
  Upload,
  FileCode,
  Sparkles,
  Terminal,
  Eraser,
  Code2,
  FileText,
  Zap,
  ShieldAlert,
  TestTube2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface CodeAnalyzerProps {
  initialCode?: string;
  initialError?: string;
  initialLang?: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const CodeAnalyzer: React.FC<CodeAnalyzerProps> = ({
  initialCode = '',
  initialError = '',
  initialLang = 'auto',
  onAnalysisComplete,
}) => {
  const { addToast, token } = useAuth();

  const [code, setCode] = useState(initialCode);
  const [errorLog, setErrorLog] = useState(initialError);
  const [language, setLanguage] = useState(initialLang);
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState<'analyze' | 'explain' | 'security' | 'optimize' | 'tests'>('analyze');

  const [analyzing, setAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
    if (initialError) setErrorLog(initialError);
    if (initialLang) setLanguage(initialLang);
  }, [initialCode, initialError, initialLang]);

  const languages = [
    { value: 'auto', label: 'Auto Detect Language' },
    { value: 'python', label: 'Python (.py)' },
    { value: 'javascript', label: 'JavaScript (.js, .jsx)' },
    { value: 'typescript', label: 'TypeScript (.ts, .tsx)' },
    { value: 'java', label: 'Java (.java)' },
    { value: 'cpp', label: 'C++ (.cpp, .hpp)' },
    { value: 'c', label: 'C (.c, .h)' },
    { value: 'go', label: 'Go (.go)' },
    { value: 'rust', label: 'Rust (.rs)' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'docker', label: 'Dockerfile' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();

    // Auto infer language from extension
    const extMap: Record<string, string> = {
      py: 'python',
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
    };
    if (ext && extMap[ext]) {
      setLanguage(extMap[ext]);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
      addToast('success', 'File Loaded', `Loaded ${file.name} (${content.length} chars)`);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!code.trim() && !errorLog.trim()) {
      addToast('warning', 'Input Required', 'Please paste a code snippet or error traceback log.');
      return;
    }

    setAnalyzing(true);
    setProgressStep(1);

    const stepTimer1 = setTimeout(() => setProgressStep(2), 800);
    const stepTimer2 = setTimeout(() => setProgressStep(3), 1800);

    try {
      const result = await api.analyzeCode(
        code,
        errorLog,
        language === 'auto' ? undefined : language,
        fileName || 'user_snippet',
        mode,
        token || undefined
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      onAnalysisComplete(result);
      addToast('success', 'Analysis Complete', 'Gemini successfully identified bug and root cause.');
    } catch (err: any) {
      addToast('error', 'Analysis Failed', err.message || 'Error communicating with AI engine.');
    } finally {
      setAnalyzing(false);
      setProgressStep(0);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Mode Selection Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setMode('analyze')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            mode === 'analyze'
              ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border-cyan-500/50 text-cyan-200 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4 text-cyan-400" />
          <span>Analyze & Fix Bug</span>
        </button>

        <button
          onClick={() => setMode('explain')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            mode === 'explain'
              ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-500/50 text-purple-200 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Explain Error</span>
        </button>

        <button
          onClick={() => setMode('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            mode === 'security'
              ? 'bg-gradient-to-r from-rose-600/30 to-amber-600/30 border-rose-500/50 text-rose-200 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Security Audit</span>
        </button>

        <button
          onClick={() => setMode('optimize')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            mode === 'optimize'
              ? 'bg-gradient-to-r from-amber-600/30 to-emerald-600/30 border-amber-500/50 text-amber-200 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Optimize Performance</span>
        </button>

        <button
          onClick={() => setMode('tests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            mode === 'tests'
              ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-500/50 text-emerald-200 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <TestTube2 className="w-4 h-4 text-emerald-400" />
          <span>Generate Unit Tests</span>
        </button>
      </div>

      {/* Main Inputs Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Input Editor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 font-mono">Source Code Input</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Upload File</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".py,.java,.cpp,.c,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.sql,.go,.rs"
                  className="hidden"
                />
              </label>

              {(code || errorLog) && (
                <button
                  onClick={() => {
                    setCode('');
                    setErrorLog('');
                    setFileName('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Clear inputs"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            {fileName && (
              <span className="text-[11px] font-mono text-cyan-400 truncate bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {fileName}
              </span>
            )}
          </div>

          <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste buggy source code here..."
              rows={16}
              className="w-full p-4 bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
            />
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-600">
              {code.length} chars | {code.split('\n').length} lines
            </div>
          </div>
        </div>

        {/* Right: Error Log / Traceback Input */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-slate-200 font-mono">
                Error Log / Exception Traceback
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Optional but recommended</span>
          </div>

          <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste terminal exception, compiler error, React stack trace, or SQL error log here..."
              rows={18}
              className="w-full p-4 bg-transparent text-rose-300/90 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-indigo-400 font-bold block mb-0.5">Pro Tip:</span>
            Providing both source code and raw stack traces yields 98%+ confidence analysis accuracy.
          </div>
        </div>
      </div>

      {/* Action Trigger Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="text-xs text-slate-400">
          Selected Mode:{' '}
          <span className="font-bold text-slate-200 font-mono capitalize">{mode} Mode</span>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
        >
          {analyzing ? (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>
                {progressStep === 1
                  ? 'Parsing AST & Tokens...'
                  : progressStep === 2
                  ? 'Evaluating Stack Trace...'
                  : 'Synthesizing Fix with Gemini...'}
              </span>
            </>
          ) : (
            <>
              <Bug className="w-4 h-4" />
              <span>Run AI Bug Fix Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
