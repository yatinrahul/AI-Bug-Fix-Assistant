import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ShieldAlert, Sparkles, Copy, Check, Code2, AlertTriangle, Lock } from 'lucide-react';

export const SecurityScannerView: React.FC = () => {
  const { addToast, token } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = async () => {
    if (!code.trim()) {
      addToast('warning', 'Input Required', 'Please paste code to run security audit.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.securityScan(code, language === 'auto' ? undefined : language, token || undefined);
      setScanResult(res);
      addToast('success', 'Security Scan Complete', `Audit found ${res.vulnerabilities?.length || 0} issues.`);
    } catch (err: any) {
      addToast('error', 'Security Scan Error', err.message || 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">OWASP Security Vulnerability Scanner</h1>
            <p className="text-xs text-slate-400">
              Audit source code for SQL Injection, XSS, Hardcoded Keys, Command Injection, CSRF, and Deserialization flaws.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 font-mono">Code to Audit</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
            >
              <option value="auto">Auto Detect</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript / Node</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste code to scan for security risks..."
            rows={16}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none resize-none leading-relaxed"
          />

          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Auditing OWASP Top 10 Flaws...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Execute Security Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Audit Output */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 overflow-y-auto max-h-[600px]">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 font-mono">Audit Results</span>
            {scanResult?.securityScore !== undefined && (
              <span className="text-xs font-bold text-emerald-400 font-mono">
                Security Score: {scanResult.securityScore}/100
              </span>
            )}
          </div>

          {!scanResult ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Paste code and run scan to display security audit details.
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{scanResult.summary}</p>

              {scanResult.vulnerabilities?.map((v: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {v.type}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{v.description}</p>
                  {v.remediation && (
                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                      {v.remediation}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
