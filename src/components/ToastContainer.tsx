import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-400" />;
        let border = 'border-blue-500/30 bg-slate-900/90 text-slate-100';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          border = 'border-emerald-500/30 bg-slate-900/90 text-slate-100';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-400" />;
          border = 'border-rose-500/30 bg-slate-900/90 text-slate-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          border = 'border-amber-500/30 bg-slate-900/90 text-slate-100';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-2 ${border}`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold tracking-wide uppercase text-slate-200">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
