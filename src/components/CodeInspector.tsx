import React, { useState } from 'react';
import { FileCode, Folder, Copy, Check, Download, Layers, Code, Sparkles } from 'lucide-react';
import { flutterFiles } from '../data/dartCodeStore';
import { CodeFile } from '../types';

interface CodeInspectorProps {
  onExportZip: () => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ onExportZip }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(flutterFiles[1] || flutterFiles[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      {/* Overview Banner */}
      <div className="bg-[#1B132D] p-5 rounded-2xl border border-[#2E224B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Flutter Project Architecture & Code Inspector
            <Sparkles className="w-4 h-4 text-[#8A4FFF]" />
          </h2>
          <p className="text-xs text-[#A098B9]">
            Feature-First modular Dart structure (`lib/core/`, `lib/features/`, `flutter_riverpod`, `go_router`)
          </p>
        </div>

        <button
          onClick={onExportZip}
          className="bg-gradient-to-r from-[#6C5CE7] to-[#8A4FFF] hover:opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          Download Full Flutter Project (.zip)
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#1B132D] rounded-2xl border border-[#2E224B] overflow-hidden min-h-[600px] shadow-2xl">
        {/* File Tree Sidebar */}
        <div className="bg-[#150F28] p-3 border-r border-[#2E224B] space-y-2">
          <div className="text-[11px] font-bold text-[#A098B9] uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Project Explorer</span>
            <span className="text-[10px] text-[#8A4FFF] bg-[#8A4FFF]/10 px-1.5 py-0.5 rounded">
              {flutterFiles.length} files
            </span>
          </div>

          <div className="space-y-1">
            {flutterFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 truncate ${
                    isSelected
                      ? 'bg-[#6C5CE7] text-white font-bold shadow-md'
                      : 'text-[#A098B9] hover:bg-[#281C42] hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code View Pane */}
        <div className="md:col-span-3 flex flex-col bg-[#0F0A1C]">
          {/* Header Bar */}
          <div className="bg-[#150F28] px-4 py-3 border-b border-[#2E224B] flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-[#8A4FFF] font-bold">
              <Code className="w-4 h-4 text-[#8A4FFF]" />
              <span>{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-[#281C42] hover:bg-[#322452] text-[#A098B9] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all border border-[#2E224B]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadSingle}
                className="p-1.5 rounded-lg bg-[#281C42] hover:bg-[#322452] text-[#A098B9] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all border border-[#2E224B]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Code Text View */}
          <div className="p-4 overflow-auto flex-1 font-mono text-xs leading-relaxed text-[#D8D2ED] bg-[#0F0A1C] selection:bg-[#6C5CE7] selection:text-white">
            <pre className="whitespace-pre">{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
