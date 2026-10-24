import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ModProject, ModItem, buildFabricModJar, buildFabricWorkspaceZip } from '../lib/modPackager.ts';
import { MinecraftPreview } from './MinecraftPreview.tsx';
import { JarFileViewer } from './JarFileViewer.tsx';
import { PixelEditor } from './PixelEditor.tsx';
import { InstallGuide } from './InstallGuide.tsx';
import { generateItemTexture } from '../lib/textureGenerator.ts';
import {
  Download,
  FolderArchive,
  Eye,
  FileCode,
  Palette,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  ArrowLeft,
  Check,
  ShieldAlert,
  PackageCheck,
  Link2,
  Copy,
  X,
  ExternalLink,
} from 'lucide-react';

interface ModStudioProps {
  mod: ModProject;
  onUpdateMod: (updated: ModProject) => void;
  onBackToForge: () => void;
}

export const ModStudio: React.FC<ModStudioProps> = ({
  mod,
  onUpdateMod,
  onBackToForge,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'files' | 'texture' | 'mixins' | 'install'>('preview');
  const [selectedItemForTexture, setSelectedItemForTexture] = useState<ModItem>(mod.items[0]);
  const [isDownloadingJar, setIsDownloadingJar] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Direct download link state
  const [jarBlobUrl, setJarBlobUrl] = useState<string | null>(null);
  const [jarSizeStr, setJarSizeStr] = useState<string>('Compiling...');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const jarFileName = `${mod.modId}-${mod.version || '1.0.0'}.jar`;
  const zipFileName = `${mod.modId}-workspace.zip`;

  // Compile jar in background on mod change to prepare instant download link
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function prepareJar() {
      try {
        setJarSizeStr('Compiling .jar...');
        const jarBlob = await buildFabricModJar(mod);
        if (!active) return;

        createdUrl = URL.createObjectURL(jarBlob);
        setJarBlobUrl(createdUrl);
        const kb = (jarBlob.size / 1024).toFixed(1);
        setJarSizeStr(`${kb} KB`);
      } catch (err) {
        console.error('Failed to prepare background .jar link:', err);
        if (active) setJarSizeStr('Ready to Build');
      }
    }

    prepareJar();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [mod]);

  const handleDownloadJar = async (e?: React.MouseEvent) => {
    try {
      setIsDownloadingJar(true);

      let urlToUse = jarBlobUrl;
      if (!urlToUse) {
        const jarBlob = await buildFabricModJar(mod);
        urlToUse = URL.createObjectURL(jarBlob);
        setJarBlobUrl(urlToUse);
        const kb = (jarBlob.size / 1024).toFixed(1);
        setJarSizeStr(`${kb} KB`);
      }

      // Trigger standard anchor download
      const a = document.createElement('a');
      a.href = urlToUse;
      a.download = jarFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Confetti celebration
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'],
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to build .jar:', err);
      alert('Failed to package .jar file. Please check console.');
    } finally {
      setIsDownloadingJar(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const zipBlob = await buildFabricWorkspaceZip(mod);

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to build zip workspace:', err);
      alert('Failed to build workspace zip.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleSaveItemTexture = (newGrid: any) => {
    if (!selectedItemForTexture) return;
    const updatedItems = mod.items.map(item =>
      item.id === selectedItemForTexture.id ? { ...item, customGrid: newGrid } : item
    );
    onUpdateMod({ ...mod, items: updatedItems });
  };

  const copyPathInstruction = () => {
    navigator.clipboard.writeText(`%appdata%\\.minecraft\\mods\\${jarFileName}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="bg-[#10131d] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onBackToForge}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/80 mt-1"
            title="Create another mod"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {mod.modName}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono px-2 py-0.5 rounded font-bold">
                MC {mod.minecraftVersion}
              </span>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono px-2 py-0.5 rounded font-bold">
                Fabric Loader {mod.fabricLoaderVersion}
              </span>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-mono px-2 py-0.5 rounded font-bold">
                Java {mod.javaVersion}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">
              {mod.description}
            </p>
            <div className="mt-2 text-[11px] text-slate-500 font-mono">
              Package: <span className="text-slate-400">{mod.packageName}</span> &bull; Main Class:{' '}
              <span className="text-slate-400">{mod.mainClassName}</span>
            </div>
          </div>
        </div>

        {/* Action Download Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="px-4 py-2.5 rounded-xl bg-[#171c2b] hover:bg-[#1f263b] text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
            title="Download full Gradle project for IntelliJ / VS Code"
          >
            <FolderArchive className="w-4 h-4 text-cyan-400" />
            <span>{isDownloadingZip ? 'Zipping...' : 'Workspace (.zip)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadJar()}
            disabled={isDownloadingJar}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-200" />
                <span>{isDownloadingJar ? 'Building .jar...' : `Download ${jarFileName}`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Direct .JAR Download Link Card */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-[#131b27] to-cyan-950/70 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                Fabric .JAR Complete & Ready
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                {jarSizeStr}
              </span>
            </div>
            <div className="text-white font-mono font-bold text-base mt-0.5">
              {jarFileName}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Formatted for Minecraft <strong className="text-emerald-400">{mod.minecraftVersion}</strong> (Fabric Loader {mod.fabricLoaderVersion}). Direct drop-in into your <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-slate-300">.minecraft/mods</code> folder.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Direct Download Anchor Link */}
          <a
            href={jarBlobUrl || '#'}
            onClick={(e) => {
              if (!jarBlobUrl) {
                e.preventDefault();
                handleDownloadJar();
              } else {
                confetti({
                  particleCount: 90,
                  spread: 75,
                  origin: { y: 0.6 },
                  colors: ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'],
                });
                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 3500);
              }
            }}
            download={jarFileName}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4 text-black" />
            <span>Click to Download Mod .JAR</span>
          </a>

          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Download link details & paths"
          >
            <Link2 className="w-4 h-4 text-emerald-400" />
            <span>Link Details</span>
          </button>
        </div>
      </div>

      {mod.note && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-amber-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{mod.note}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>In-Game Showcase & HUD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'files'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>JAR Files & Java Code</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('texture')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'texture'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>16x16 Texture Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mixins')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'mixins'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Fabric Mixins ({(mod.mixins || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('install')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'install'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Installation Guide</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'preview' && (
          <MinecraftPreview
            mod={mod}
            activeItem={selectedItemForTexture}
            onSelectItem={(item) => setSelectedItemForTexture(item)}
          />
        )}

        {activeTab === 'files' && (
          <JarFileViewer
            mod={mod}
            onUpdateFileContent={(path, content) => {
              if (path.endsWith('.java')) {
                const updatedSources = mod.javaSources.map(s =>
                  s.filePath === path ? { ...s, content } : s
                );
                onUpdateMod({ ...mod, javaSources: updatedSources });
              }
            }}
          />
        )}

        {activeTab === 'texture' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Item & Block Texture Studio</h3>
                <p className="text-xs text-slate-400">
                  Select an item or block below to draw or touch up its 16x16 pixel texture.
                </p>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target Item:</span>
                <select
                  value={selectedItemForTexture?.id}
                  onChange={(e) => {
                    const found = mod.items.find(i => i.id === e.target.value);
                    if (found) setSelectedItemForTexture(found);
                  }}
                  className="bg-[#141824] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {mod.items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedItemForTexture && (
              <PixelEditor
                key={selectedItemForTexture.id}
                title={selectedItemForTexture.name}
                initialGrid={
                  selectedItemForTexture.customGrid ||
                  generateItemTexture(
                    selectedItemForTexture.type,
                    selectedItemForTexture.palette?.primaryColor,
                    selectedItemForTexture.palette?.secondaryColor,
                    selectedItemForTexture.palette?.accentColor
                  )
                }
                primaryColor={selectedItemForTexture.palette?.primaryColor}
                secondaryColor={selectedItemForTexture.palette?.secondaryColor}
                accentColor={selectedItemForTexture.palette?.accentColor}
                onSave={handleSaveItemTexture}
              />
            )}
          </div>
        )}

        {activeTab === 'mixins' && (
          <div className="space-y-6">
            <div className="bg-[#121622] border border-slate-800 rounded-xl p-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Fabric Mixin Hooks Architecture
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Mixins allow Fabric mods to modify Minecraft bytecode at runtime without altering the original vanilla code. Below are the Mixins generated for this mod:
              </p>
            </div>

            {(mod.mixins || []).length > 0 ? (
              <div className="space-y-4">
                {mod.mixins!.map(mixin => (
                  <div key={mixin.name} className="bg-[#121622] border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {mixin.name}.java
                      </div>
                      <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                        Target: {mixin.targetClass}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      {mixin.description}
                    </div>

                    <pre className="p-3 bg-[#0a0d15] rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                      <code>{mixin.javaCode}</code>
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-[#121622] rounded-xl border border-slate-800 text-center text-slate-400 text-sm">
                This mod relies exclusively on Fabric API Registry and events, requiring no bytecode mixins.
              </div>
            )}
          </div>
        )}

        {activeTab === 'install' && <InstallGuide mod={mod} />}
      </div>

      {/* Download Link & Info Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Fabric Mod .JAR Download</h3>
                <p className="text-xs text-slate-400">Minecraft {mod.minecraftVersion} (Fabric)</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 bg-[#0c0f18] rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-mono">
                  <span>Filename:</span>
                  <span className="text-emerald-400 font-bold">{jarFileName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 font-mono">
                  <span>Size:</span>
                  <span className="text-white">{jarSizeStr}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 font-mono">
                  <span>Compatibility:</span>
                  <span className="text-cyan-300">Minecraft {mod.minecraftVersion} / Fabric {mod.fabricLoaderVersion}</span>
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1">Direct Download Link:</div>
                <div className="flex items-center gap-2">
                  <a
                    href={jarBlobUrl || '#'}
                    download={jarFileName}
                    onClick={() => {
                      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                    }}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {jarFileName}</span>
                  </a>
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1">Installation Directory:</div>
                <div className="flex items-center justify-between bg-[#0b0e16] border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-slate-300">
                  <span className="truncate">%appdata%\.minecraft\mods</span>
                  <button
                    type="button"
                    onClick={copyPathInstruction}
                    className="text-slate-400 hover:text-white ml-2 flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
