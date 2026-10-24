import React, { useState } from 'react';
import { JarFileEntry, ModProject, listJarFiles } from '../lib/modPackager.ts';
import {
  FileCode,
  FileJson,
  FileText,
  Binary,
  Image,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';

interface JarFileViewerProps {
  mod: ModProject;
  onUpdateFileContent?: (path: string, newContent: string) => void;
}

export const JarFileViewer: React.FC<JarFileViewerProps> = ({
  mod,
  onUpdateFileContent,
}) => {
  const files = listJarFiles(mod);
  const [selectedPath, setSelectedPath] = useState<string>(files[1]?.path || 'fabric.mod.json');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState<Record<string, string>>({});

  const filteredFiles = files.filter(f =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFile = files.find(f => f.path === selectedPath) || files[0];
  const currentContent = editableContent[selectedPath] ?? selectedFile?.content ?? '';

  const handleCopy = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditableContent(prev => ({ ...prev, [selectedPath]: val }));
    if (onUpdateFileContent) {
      onUpdateFileContent(selectedPath, val);
    }
  };

  const getFileIcon = (file: JarFileEntry) => {
    switch (file.type) {
      case 'java':
        return <FileCode className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'binary':
        return <Binary className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'image':
        return <Image className="w-4 h-4 text-cyan-400 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-[#0f121b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
      {/* Top Bar */}
      <div className="bg-[#151a27] border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            JAR Archive
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-white font-medium">{mod.modId}-{mod.version || '1.0.0'}.jar</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedFile?.content && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left: File Tree */}
        <div className="md:col-span-4 bg-[#111420] border-r border-slate-800 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jar files..."
                className="w-full bg-[#181d2c] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
            {filteredFiles.map((file) => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors truncate ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 font-medium border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {getFileIcon(file)}
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code & Content Editor */}
        <div className="md:col-span-8 flex flex-col bg-[#0a0d15] overflow-hidden">
          {/* File Header */}
          <div className="bg-[#131724] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              {getFileIcon(selectedFile)}
              <span className="text-white font-medium truncate">{selectedFile.path}</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              {selectedFile.type.toUpperCase()}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedFile.type === 'binary' ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Binary className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Compiled JVM Bytecode Class</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    This file is synthesized directly into genuine JVM bytecode (magic <code className="text-purple-300">0xCAFEBABE</code>, Java {mod.javaVersion} compatibility level).
                  </p>
                </div>
                <div className="bg-[#121622] border border-slate-800 rounded-lg p-3 text-left font-mono text-[11px] text-slate-300 w-full max-w-md">
                  <div className="text-emerald-400 font-semibold mb-1">Class Metadata:</div>
                  <div>Magic: 0xCAFEBABE</div>
                  <div>Implements: net.fabricmc.api.ModInitializer</div>
                  <div>Constructor: public void &lt;init&gt;()</div>
                  <div>Entrypoint: public void onInitialize()</div>
                  <div>Target Version: Java {mod.javaVersion} (Bytecode Major: {mod.javaVersion >= 21 ? 65 : mod.javaVersion <= 8 ? 52 : mod.javaVersion <= 16 ? 60 : 61})</div>
                </div>
              </div>
            ) : selectedFile.type === 'image' ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-[#161a27] border-2 border-slate-700 flex items-center justify-center p-2 shadow-2xl">
                  {/* Texture icon */}
                  <Image className="w-12 h-12 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Texture Asset (PNG)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Compiled directly into standard 16x16 / 32x32 RGBA PNG texture inside the JAR.
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    Tip: Switch to the Texture Studio tab above to draw or edit pixel art!
                  </p>
                </div>
              </div>
            ) : (
              <textarea
                value={currentContent}
                onChange={handleContentChange}
                spellCheck={false}
                className="w-full h-full bg-transparent text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-emerald-500/30"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
