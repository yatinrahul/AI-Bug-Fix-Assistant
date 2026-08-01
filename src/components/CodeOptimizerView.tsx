import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Zap, Sparkles, Copy, Check, ArrowRight, Gauge } from 'lucide-react';

export const CodeOptimizerView: React.FC = () => {
  const { addToast, token } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);

  const handleOptimize = async () => {
    if (!code.trim()) {
      addToast('warning', 'Input Required', 'Please paste code to optimize.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.optimizeCode(code, language === 'auto' ? undefined : language, token || undefined);
      setOptResult(res);
      addToast('success', 'Optimization Complete', 'Generated refactored performance version.');
    } catch (err: any) {
      addToast('error', 'Optimization Failed', err.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Code Performance & Complexity Optimizer</h1>
            <p className="text-xs text-slate-400">
              Refactor algorithms, eliminate memory leaks, lower Big-O complexity, and modernize syntax.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 font-mono">Unoptimized Code</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
            >
              <option value="auto">Auto Detect</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste unoptimized code here..."
            rows={16}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none resize-none leading-relaxed"
          />

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Optimizing Big-O & Memory...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Optimize Performance</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Output */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 font-mono">Optimized Result</span>
            {optResult && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(optResult.optimizedCode);
                  addToast('success', 'Copied!', 'Optimized code copied.');
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            )}
          </div>

          {!optResult ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Paste code and run optimization to view performance refactor.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Time Complexity</span>
                  <span className="text-amber-400 font-bold">{optResult.timeComplexityBefore || 'N/A'}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 inline mx-1" />
                  <span className="text-emerald-400 font-bold">{optResult.timeComplexityAfter || 'O(N)'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Space Complexity</span>
                  <span className="text-amber-400 font-bold">{optResult.spaceComplexityBefore || 'N/A'}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 inline mx-1" />
                  <span className="text-emerald-400 font-bold">{optResult.spaceComplexityAfter || 'O(1)'}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <pre className="text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed max-h-[350px]">
                  {optResult.optimizedCode}
                </pre>
              </div>

              {optResult.improvements && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 block mb-1 font-mono uppercase text-[10px]">Key Improvements:</span>
                  <ul className="space-y-1 text-slate-400">
                    {optResult.improvements.map((imp: string, i: number) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
