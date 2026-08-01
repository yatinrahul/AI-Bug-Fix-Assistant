import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TestTube2, Sparkles, Copy, Download, Code2, Check } from 'lucide-react';

export const UnitTestGeneratorView: React.FC = () => {
  const { addToast, token } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [framework, setFramework] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const frameworks = [
    { value: 'auto', label: 'Auto (Match Language)' },
    { value: 'PyTest', label: 'PyTest (Python)' },
    { value: 'unittest', label: 'Python unittest' },
    { value: 'Jest', label: 'Jest (JS / TS)' },
    { value: 'Vitest', label: 'Vitest (React / Vite)' },
    { value: 'Mocha', label: 'Mocha & Chai' },
    { value: 'JUnit 5', label: 'JUnit 5 (Java)' },
    { value: 'TestNG', label: 'TestNG (Java)' },
    { value: 'Go testing', label: 'Go testing package' },
    { value: 'Cargo test', label: 'Cargo test (Rust)' },
  ];

  const handleGenerate = async () => {
    if (!code.trim()) {
      addToast('warning', 'Input Required', 'Please paste source code to generate unit tests.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.generateTests(
        code,
        language === 'auto' ? undefined : language,
        framework === 'auto' ? undefined : framework,
        token || undefined
      );
      setTestResult(res);
      addToast('success', 'Unit Tests Generated', `Created test suite with ${res.framework}.`);
    } catch (err: any) {
      addToast('error', 'Generation Failed', err.message || 'Failed to generate unit tests.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TestTube2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Automated Unit Test Generator</h1>
            <p className="text-xs text-slate-400">
              Produce runnable unit test suites (PyTest, Jest, JUnit, Vitest) covering happy paths and edge cases.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-200 font-mono">Source Code</span>
            <div className="flex items-center gap-2">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
              >
                {frameworks.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste function or module code to generate unit tests for..."
            rows={16}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none resize-none leading-relaxed"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Synthesizing Test Assertions & Mocks...</span>
              </>
            ) : (
              <>
                <TestTube2 className="w-4 h-4" />
                <span>Generate Test Suite</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Output */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 font-mono">Generated Tests</span>
            {testResult && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(testResult.unitTestCode);
                  addToast('success', 'Copied!', 'Unit tests copied.');
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Tests</span>
              </button>
            )}
          </div>

          {!testResult ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Paste code and click generate to build executable test suites.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between">
                <span>Framework: {testResult.framework}</span>
                <span className="text-emerald-400 font-bold">Ready to run</span>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[420px]">
                {testResult.unitTestCode}
              </pre>

              {testResult.instructions && (
                <p className="text-[11px] text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-0.5">Execution Instructions:</span>
                  {testResult.instructions}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
