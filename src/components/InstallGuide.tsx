import React, { useState } from 'react';
import { ModProject } from '../lib/modPackager.ts';
import { Download, FolderCheck, Terminal, AlertTriangle, CheckCircle2, Copy, Check } from 'lucide-react';

interface InstallGuideProps {
  mod: ModProject;
}

export const InstallGuide: React.FC<InstallGuideProps> = ({ mod }) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(id);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const jarFileName = `${mod.modId}-${mod.version || '1.0.0'}.jar`;

  return (
    <div className="space-y-6">
      {/* Quick Overview Card */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#121622] to-cyan-950/40 border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Ready-to-Play Fabric Mod for Minecraft {mod.minecraftVersion}
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Your compiled <span className="font-mono text-emerald-300 font-semibold">{jarFileName}</span> is formatted with standard Fabric Mod metadata (<code className="text-xs bg-black/40 px-1 py-0.5 rounded">fabric.mod.json</code>), resource assets, crafting recipes, and ModInitializer bytecode.
            </p>
          </div>
        </div>
      </div>

      {/* Methods Tabs / Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method 1: Drop into .minecraft/mods */}
        <div className="bg-[#121622] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <FolderCheck className="w-5 h-5" />
            Method A: Standard Minecraft Launcher
          </div>

          <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
            <li className="leading-relaxed">
              <strong className="text-white">Install Fabric Loader:</strong> Run the official Fabric installer for Minecraft <span className="text-emerald-400 font-mono">{mod.minecraftVersion}</span> (Loader version: <span className="font-mono">{mod.fabricLoaderVersion}</span>).
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Install Fabric API:</strong> Download the matching Fabric API <code className="text-[11px] bg-slate-800 px-1 py-0.5 rounded text-amber-300">fabric-api</code> mod from Modrinth or CurseForge.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Put the .jar file into mods folder:</strong>
              Copy <code className="text-emerald-300 font-mono">{jarFileName}</code> into your local Minecraft mods folder:
            </li>
          </ol>

          {/* Folder Paths */}
          <div className="space-y-2 pt-2">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Windows Path:</div>
              <div className="flex items-center justify-between bg-[#0b0e16] border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-[11px] text-slate-300">
                <span className="truncate">%appdata%\.minecraft\mods</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('%appdata%\\.minecraft\\mods', 'win')}
                  className="text-slate-400 hover:text-white ml-2 shrink-0"
                >
                  {copiedPath === 'win' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">macOS Path:</div>
              <div className="flex items-center justify-between bg-[#0b0e16] border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-[11px] text-slate-300">
                <span className="truncate">~/Library/Application Support/minecraft/mods</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('~/Library/Application Support/minecraft/mods', 'mac')}
                  className="text-slate-400 hover:text-white ml-2 shrink-0"
                >
                  {copiedPath === 'mac' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Linux Path:</div>
              <div className="flex items-center justify-between bg-[#0b0e16] border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-[11px] text-slate-300">
                <span className="truncate">~/.minecraft/mods</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('~/.minecraft/mods', 'linux')}
                  className="text-slate-400 hover:text-white ml-2 shrink-0"
                >
                  {copiedPath === 'linux' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Method 2: Modern Launchers (Prism / Modrinth / CurseForge) & Gradle Dev */}
        <div className="bg-[#121622] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Terminal className="w-5 h-5" />
            Method B: Mod Managers or Developer Workspace
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <div className="font-semibold text-white mb-1">Prism Launcher / Modrinth App:</div>
              <p className="leading-relaxed">
                1. Create an instance for Minecraft <span className="font-mono text-cyan-300">{mod.minecraftVersion}</span> with Fabric Loader.
                <br />
                2. Click &quot;Add Mod&quot; or open folder and drop <code className="text-emerald-300 font-mono">{jarFileName}</code> directly in.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="font-semibold text-white mb-1">Developing in IntelliJ IDEA / VS Code:</div>
              <p className="leading-relaxed mb-2">
                Click &quot;Download Workspace (.zip)&quot; at the top to get the complete Fabric Loom project. Then run:
              </p>
              <div className="bg-[#0b0e16] border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-emerald-400 space-y-1">
                <div>./gradlew runClient</div>
                <div className="text-slate-500"># or compile with:</div>
                <div>./gradlew build</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Java Version Compatibility Note */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="text-amber-300">Target Java Runtime: Java {mod.javaVersion}</strong>
          <p className="mt-0.5 leading-relaxed">
            Minecraft {mod.minecraftVersion} requires Java {mod.javaVersion} (e.g. Eclipse Temurin or Oracle JDK {mod.javaVersion}). Official Minecraft launchers bundle the appropriate Java runtime automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
