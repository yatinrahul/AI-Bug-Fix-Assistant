import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectFile, AnalysisResult } from '../types';
import { FolderUp, FileCode, Bug, Sparkles, Check, ChevronRight, FileArchive } from 'lucide-react';

interface ProjectUploaderProps {
  onAnalyzeFile: (code: string, fileName: string, language: string) => void;
}

export const ProjectUploader: React.FC<ProjectUploaderProps> = ({ onAnalyzeFile }) => {
  const { addToast } = useAuth();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [loading, setLoading] = useState(false);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    if (!uploaded.name.endsWith('.zip')) {
      addToast('warning', 'Invalid File', 'Please upload a .zip archive.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        const res = await api.uploadZip(base64);
        setFiles(res.files || []);
        if (res.files && res.files.length > 0) {
          setSelectedFile(res.files[0]);
        }
        addToast('success', 'Project Unpacked', `Extracted ${res.files?.length || 0} source files.`);
      } catch (err: any) {
        addToast('error', 'Unpack Failed', err.message || 'Failed to parse zip archive.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(uploaded);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <FolderUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Project Workspace & Zip Analyzer</h1>
            <p className="text-xs text-slate-400">
              Upload a zip archive of source code files. Inspect individual files and send them directly to the AI bug repair engine.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="relative rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-8 text-center hover:border-indigo-500/50 transition-colors">
        <input
          type="file"
          accept=".zip"
          onChange={handleZipUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <FileArchive className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-200">
          {loading ? 'Unpacking Zip Archive...' : 'Drop your .zip project here or click to browse'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Supports .py, .java, .cpp, .js, .ts, .jsx, .tsx, .sql, .html, .css
        </p>
      </div>

      {/* File Browser Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File Tree List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
              Extracted Files ({files.length})
            </h3>
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-mono text-left transition-all ${
                    selectedFile?.path === file.path
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Code File Preview */}
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 flex flex-col justify-between">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold font-mono text-slate-200">
                    {selectedFile.path}
                  </span>
                  <button
                    onClick={() => onAnalyzeFile(selectedFile.content, selectedFile.name, selectedFile.language)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Analyze This File</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[400px] leading-relaxed">
                  <code>{selectedFile.content}</code>
                </pre>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                Select a file from the list to preview content.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
