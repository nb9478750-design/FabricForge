import React, { useState } from 'react';
import { HistoryItem, deleteHistoryItem, clearModHistory } from '../lib/modHistory.ts';
import { ModProject, buildFabricModJar } from '../lib/modPackager.ts';
import { generateItemTexture, pixelGridToDataUrl } from '../lib/textureGenerator.ts';
import {
  History,
  X,
  Download,
  Trash2,
  FolderOpen,
  Search,
  Calendar,
  Layers,
  Sword,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMod: (mod: ModProject) => void;
  history: HistoryItem[];
  onHistoryUpdate: (items: HistoryItem[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectMod,
  history,
  onHistoryUpdate,
}) => {
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = history.filter(item =>
    item.mod.modName.toLowerCase().includes(search.toLowerCase()) ||
    item.mod.modId.toLowerCase().includes(search.toLowerCase()) ||
    item.prompt.toLowerCase().includes(search.toLowerCase()) ||
    item.mod.minecraftVersion.includes(search)
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    onHistoryUpdate(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all mod generation history?')) {
      clearModHistory();
      onHistoryUpdate([]);
    }
  };

  const handleQuickDownloadJar = async (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloadingId(item.id);
      const jarBlob = await buildFabricModJar(item.mod);
      const url = URL.createObjectURL(jarBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.mod.modId}-${item.mod.version || '1.0.0'}.jar`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download from history:', err);
      alert('Could not package .jar file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#151a28]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Mod Generation History
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                  {history.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Previously generated Fabric mods saved in local session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear all history"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {history.length > 0 && (
          <div className="p-3 border-b border-slate-800 bg-[#0e111a]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history by mod name, description, or version..."
                className="w-full bg-[#181d2c] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* List of Mods */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <History className="w-6 h-6" />
              </div>
              <div className="text-slate-300 font-semibold text-sm">
                {history.length === 0 ? 'No mod history yet' : 'No matching mods found'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {history.length === 0
                  ? 'Describe and forge your first Minecraft mod to have it automatically recorded here!'
                  : 'Try searching for another keyword or clear the search field.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const firstItem = item.mod.items[0];
              const textureUrl = firstItem
                ? pixelGridToDataUrl(
                    firstItem.customGrid ||
                      generateItemTexture(
                        firstItem.type,
                        firstItem.palette?.primaryColor,
                        firstItem.palette?.secondaryColor,
                        firstItem.palette?.accentColor
                      )
                  )
                : '';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectMod(item.mod);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-[#151926] border border-slate-800 hover:border-emerald-500/50 hover:bg-[#1a2030] transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#0d1017] border border-slate-700 p-1 flex items-center justify-center shrink-0">
                      {textureUrl ? (
                        <img
                          src={textureUrl}
                          alt={item.mod.modName}
                          className="w-10 h-10 [image-rendering:pixelated]"
                        />
                      ) : (
                        <Sword className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors truncate">
                          {item.mod.modName}
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.2 rounded font-bold">
                          MC {item.mod.minecraftVersion}
                        </span>
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.2 rounded font-bold">
                          Loader {item.mod.fabricLoaderVersion}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1 mb-2 font-sans">
                        {item.prompt || item.mod.description}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(item.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Sword className="w-3 h-3 text-slate-400" />
                          {item.mod.items.length} Items
                        </span>
                        {(item.mod.blocks?.length || 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {item.mod.blocks?.length} Blocks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => handleQuickDownloadJar(item, e)}
                      disabled={downloadingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Download .jar directly"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === item.id ? 'Packaging...' : '.JAR'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
