import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { exportAnalysisToPdf } from '../utils/exportPdf';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Bug,
  Check,
  Copy,
  Download,
  FileText,
  ShieldAlert,
  Zap,
  TestTube2,
  MessageSquareCode,
  Share2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Code2,
  AlertCircle,
  Send,
  BookOpen,
} from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onReset }) => {
  const { addToast } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'diff' | 'security' | 'optimize' | 'tests' | 'chat' | 'similar'>('summary');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string; id: string }[]
  >([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I have completed analyzing your ${result.language} code. Feel free to ask any question like "Why did this bug happen?", "Can you explain step 2?", or "How can I improve performance further?".`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleCopy = (text: string, label: string = 'Code') => {
    navigator.clipboard.writeText(text);
    addToast('success', 'Copied!', `${label} copied to clipboard.`);
  };

  const handleDownloadFixedCode = () => {
    const extMap: Record<string, string> = {
      Python: 'py',
      JavaScript: 'js',
      TypeScript: 'ts',
      Java: 'java',
      'C++': 'cpp',
      C: 'c',
      Go: 'go',
      Rust: 'rs',
      SQL: 'sql',
      HTML: 'html',
      CSS: 'css',
    };
    const ext = extMap[result.language] || 'txt';
    const filename = `fixed_${result.fileName || 'code'}.${ext}`;

    const blob = new Blob([result.fixed_code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast('success', 'Downloaded!', `Saved as ${filename}`);
  };

  const handleShareSession = () => {
    const shareUrl = `${window.location.origin}/#share=${result.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
    addToast('success', 'Share Link Created', 'Shareable link copied to clipboard.');
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { id: 'msg_' + Date.now(), sender: 'user' as const, text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentPrompt = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.chat(
        chatMessages.concat(userMsg).map((m) => ({ sender: m.sender, text: m.text })),
        result.fixed_code || result.original_code,
        result.bug_summary
      );

      setChatMessages((prev) => [
        ...prev,
        { id: 'ai_' + Date.now(), sender: 'ai', text: res.text },
      ]);
    } catch (err: any) {
      addToast('error', 'Chat Error', err.message || 'Failed to send message.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-slate-100 font-mono">
                  Analysis Complete: {result.language}
                </h1>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                    result.severity === 'Critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : result.severity === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    result.severity === 'Critical' ? 'bg-rose-400' : result.severity === 'High' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  {result.severity} Severity
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {result.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{result.bug_summary}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShareSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => exportAnalysisToPdf(result)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar in Sleek Interface Card format */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Confidence</span>
            <span className="text-xl font-semibold text-emerald-400 mt-1 block font-mono">{result.confidence}%</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Time Complexity</span>
            <span className="text-xl font-semibold text-cyan-400 mt-1 block font-mono">{result.time_complexity}</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Space Complexity</span>
            <span className="text-xl font-semibold text-indigo-400 mt-1 block font-mono">{result.space_complexity}</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Security Flaws</span>
            <span
              className={`text-xl font-semibold mt-1 block font-mono ${
                result.security_issues.length > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {result.security_issues.length} Issues
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'summary'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>Bug & Root Cause</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diff')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'diff'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Code Diff & Fixed Code</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security Audit ({result.security_issues.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('optimize')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'optimize'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Optimization & Big-O</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tests')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'tests'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TestTube2 className="w-4 h-4" />
          <span>Unit Tests</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'chat'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquareCode className="w-4 h-4" />
          <span>AI Chat</span>
        </button>

        <button
          onClick={() => setActiveSubTab('similar')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'similar'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Docs & Similar Bugs</span>
        </button>
      </div>

      {/* SUB-TAB CONTENT 1: Summary & Step-by-Step Fix */}
      {activeSubTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Bug Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Bug Summary
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{result.bug_summary}</p>
          </div>

          {/* Root Cause */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Root Cause
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {result.root_cause}
            </p>
          </div>

          {/* Expected vs Actual Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4">
              <h4 className="text-xs font-bold uppercase text-rose-400 font-mono mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Actual Output / Bug Behavior</span>
              </h4>
              <p className="text-xs text-rose-200 font-mono bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/20 whitespace-pre-wrap">
                {result.actual_output || 'Runtime exception or unexpected behavior.'}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <h4 className="text-xs font-bold uppercase text-emerald-400 font-mono mb-2 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Expected Fixed Behavior</span>
              </h4>
              <p className="text-xs text-emerald-200 font-mono bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20 whitespace-pre-wrap">
                {result.expected_output || 'Execution succeeds cleanly as intended.'}
              </p>
            </div>
          </div>

          {/* Step-by-step Fix */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Step-by-Step Solution Guide
            </h3>
            <div className="space-y-2.5">
              {result.step_by_step_fix.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold font-mono">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          {result.best_practices && result.best_practices.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                Language Best Practices
              </h3>
              <ul className="space-y-2">
                {result.best_practices.map((bp, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB CONTENT 2: Code Diff & Fixed Code */}
      {activeSubTab === 'diff' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Split Code Comparison
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(result.fixed_code, 'Fixed Code')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Fixed Code</span>
              </button>
              <button
                onClick={handleDownloadFixedCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Code */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs font-mono">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Original Code (With Bug)
                </span>
                <span className="text-slate-500">{result.language}</span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
                <code>{result.original_code || '// No original code provided'}</code>
              </pre>
            </div>

            {/* Fixed Code */}
            <div className="rounded-xl border border-emerald-500/30 bg-slate-950 overflow-hidden flex flex-col shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Corrected Code
                </span>
                <button
                  onClick={() => handleCopy(result.fixed_code, 'Fixed Code')}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copy Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-200/90 overflow-x-auto leading-relaxed max-h-[500px]">
                <code>{result.fixed_code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 3: Security Scan */}
      {activeSubTab === 'security' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              OWASP Security Vulnerability Audit
            </h3>
            <span className="text-xs text-slate-400">
              Scanned for SQLi, XSS, Hardcoded Keys, RCE, CSRF
            </span>
          </div>

          {result.security_issues && result.security_issues.length > 0 ? (
            <div className="space-y-3">
              {result.security_issues.map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="text-sm font-bold text-rose-200">{sec.type}</span>
                      {sec.cwe && (
                        <span className="text-[10px] font-mono bg-rose-900/40 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                          {sec.cwe}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      {sec.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{sec.description}</p>

                  {sec.remediation && (
                    <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Secure Remediation Fix:
                      </span>
                      <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                        {sec.remediation}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-400">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">No Security Flaws Detected</p>
              <p className="text-[11px] text-slate-500 mt-1">
                No high-risk OWASP vulnerabilities or credentials found in this snippet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB CONTENT 4: Optimization & Complexity */}
      {activeSubTab === 'optimize' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                Time Complexity
              </span>
              <span className="text-2xl font-mono font-extrabold text-cyan-200 mt-1 block">
                {result.time_complexity}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                Evaluates scaling behavior relative to input length (N).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
              <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold">
                Space Complexity
              </span>
              <span className="text-2xl font-mono font-extrabold text-indigo-200 mt-1 block">
                {result.space_complexity}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                Evaluates auxiliary RAM/stack allocation requirements.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Refactored High-Performance Version</span>
              </h3>
              <button
                onClick={() => handleCopy(result.optimized_code, 'Optimized Code')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Optimized</span>
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200/90 overflow-x-auto max-h-[400px]">
              <code>{result.optimized_code || result.fixed_code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 5: Unit Tests */}
      {activeSubTab === 'tests' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Generated Unit Test Suite ({result.test_framework || 'Standard'})
            </h3>
            <button
              onClick={() => handleCopy(result.unit_tests, 'Unit Tests')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Test Suite</span>
            </button>
          </div>

          {result.unit_tests ? (
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[500px]">
              <code>{result.unit_tests}</code>
            </pre>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-400 text-xs">
              No unit tests explicitly requested or generated for this snippet.
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB CONTENT 6: AI Chat Assistant */}
      {activeSubTab === 'chat' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 animate-in fade-in flex flex-col h-[550px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200 font-mono">
                Contextual AI Debug Chat
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Gemini 3.6 Flash</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-sans">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {msg.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-xs text-slate-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Gemini is thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="Ask a follow-up question about this bug fix..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={!chatInput.trim() || chatLoading}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 7: Similar Bugs & Docs */}
      {activeSubTab === 'similar' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Similar Bugs */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Similar Reported Bugs & Solutions
            </h3>

            {result.similar_bugs && result.similar_bugs.length > 0 ? (
              <div className="space-y-3">
                {result.similar_bugs.map((sb, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-300 mb-1">{sb.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{sb.solution}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No similar bug signatures cataloged.</p>
            )}
          </div>

          {/* Official Documentation Links */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Documentation & References
            </h3>

            {result.documentation && result.documentation.length > 0 ? (
              <div className="space-y-2">
                {result.documentation.map((docItem, idx) => (
                  <a
                    key={idx}
                    href={docItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white text-xs text-slate-300 transition-colors"
                  >
                    <span>{docItem.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No external docs attached.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
