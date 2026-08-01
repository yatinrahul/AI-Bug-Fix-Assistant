import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter', desc: 'Trigger AI Bug Analysis' },
    { key: 'Ctrl + K', desc: 'Open Command Palette / Shortcuts' },
    { key: 'Esc', desc: 'Close open modal or drawer' },
    { key: 'Ctrl + C', desc: 'Copy selected code snippet' },
    { key: 'Ctrl + S', desc: 'Export PDF Report' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <span className="text-slate-300 font-sans">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
