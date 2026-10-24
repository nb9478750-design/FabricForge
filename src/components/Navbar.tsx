import React, { useState } from 'react';
import { Hammer, Sparkles, Box, Info, X, ExternalLink, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  historyCount = 0,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800 bg-[#0e111a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0d1017] rounded-[10px] flex items-center justify-center">
                <Hammer className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-lg font-['Plus_Jakarta_Sans']">
                  FabricForge<span className="text-emerald-400">.ai</span>
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Fabric MC 1.16 - 1.21.11
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Describe any Minecraft mod &bull; Build real ready-to-play .jar Fabric mods
              </p>
            </div>
          </div>

          {/* Quick Actions / Info */}
          <div className="flex items-center gap-2.5">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-[#161c2a] hover:bg-[#1f283d] border border-slate-700/80 transition-colors shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>History</span>
                {historyCount > 0 && (
                  <span className="bg-purple-500/20 text-purple-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full border border-purple-500/30 ml-0.5 font-bold">
                    {historyCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>How it works</span>
            </button>
          </div>
        </div>
      </header>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">About FabricForge AI</h3>
                <p className="text-xs text-slate-400">Fabric Mod Generator for Minecraft Java Edition</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">FabricForge AI</strong> turns natural language mod ideas into genuine, drop-in ready <code className="text-emerald-400 font-mono">.jar</code> Minecraft Fabric mods compatible with any Fabric Loader version and Minecraft versions from <strong>1.16 through 1.21.11+</strong>.
              </p>

              <div className="bg-[#0b0e16] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-semibold text-emerald-400 text-sm">What is packaged in the .jar?</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong className="text-white">fabric.mod.json:</strong> Official metadata with dependencies, entrypoints, and version bounds.</li>
                  <li><strong className="text-white">Compiled JVM Bytecode:</strong> Synthesized <code className="font-mono text-purple-300">.class</code> file implementing <code className="font-mono">ModInitializer</code>.</li>
                  <li><strong className="text-white">Java Sources:</strong> Full Java code for items, blocks, and mixins.</li>
                  <li><strong className="text-white">16x16 Pixel Art Textures:</strong> Generated PNG item and block textures.</li>
                  <li><strong className="text-white">pack.mcmeta & Lang JSON:</strong> Localization and resource pack formats tailored to the exact Minecraft version.</li>
                  <li><strong className="text-white">Recipes & Blockstates:</strong> Data pack JSONs for shaped/shapeless crafting.</li>
                </ul>
              </div>

              <p>
                You can also download the complete <strong className="text-cyan-400">Fabric Loom Gradle Workspace</strong> if you want to open and extend the project in IntelliJ IDEA or VS Code!
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
