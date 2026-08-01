import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HistoryItem } from '../types';
import { History, Search, Bookmark, Trash2, Eye, FileText, Filter, Star } from 'lucide-react';

interface DebugHistoryViewProps {
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export const DebugHistoryView: React.FC<DebugHistoryViewProps> = ({ onSelectHistoryItem }) => {
  const { addToast, token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterBookmarked, setFilterBookmarked] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(token || undefined);
      setHistory(data);
    } catch (err: any) {
      addToast('error', 'History Error', 'Failed to fetch debug history.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.bookmarkHistory(id, token || undefined);
      setHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, bookmarked: res.bookmarked } : item))
      );
      addToast('info', res.bookmarked ? 'Bookmarked' : 'Bookmark Removed', '');
    } catch (err) {
      addToast('error', 'Error', 'Failed to update bookmark.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this debug record?')) return;

    try {
      await api.deleteHistory(id, token || undefined);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      addToast('success', 'Deleted', 'Debug session removed from history.');
    } catch (err) {
      addToast('error', 'Error', 'Failed to delete record.');
    }
  };

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bugSummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity;
    const matchesBookmark = !filterBookmarked || item.bookmarked;

    return matchesSearch && matchesSeverity && matchesBookmark;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Debug History & Audit Archive</h1>
            <p className="text-xs text-slate-400">
              Review, search, bookmark, and export past debugging sessions and AI analyses.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language, bug..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={() => setFilterBookmarked(!filterBookmarked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${filterBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Starred Only</span>
          </button>
        </div>
      </div>

      {/* History List Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading history archive...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
          No matching debug records found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={(e) => handleToggleBookmark(item.id, e)}
                  className="text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-4 h-4 ${item.bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200 font-mono truncate">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {item.language}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.bugSummary}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.severity === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.severity === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {item.severity}
                </span>

                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
