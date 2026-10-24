import React, { useState } from 'react';
import { Sparkles, Wand2, Settings2, Hammer, ChevronDown, ChevronUp, Layers, Check } from 'lucide-react';
import { MOD_PRESETS, PresetMod } from '../lib/presets.ts';

interface ModGeneratorFormProps {
  onGenerate: (data: {
    prompt: string;
    mcVersion: string;
    fabricVersion: string;
    modName?: string;
    modId?: string;
    modAuthor?: string;
  }) => void;
  isLoading: boolean;
  loadingStep: string;
}

const MC_VERSIONS = [
  { version: '1.21.11', label: '1.21.11 (Latest Minecraft Release 🔥)', java: 21, loader: '0.16.14' },
  { version: '1.21.10', label: '1.21.10 (Recent Release)', java: 21, loader: '0.16.12' },
  { version: '1.21.5',  label: '1.21.5 (Stable)', java: 21, loader: '0.16.10' },
  { version: '1.21.4',  label: '1.21.4 (Stable)', java: 21, loader: '0.16.9' },
  { version: '1.21.3',  label: '1.21.3 (Stable)', java: 21, loader: '0.16.7' },
  { version: '1.21.2',  label: '1.21.2 (Bundles & Bravery)', java: 21, loader: '0.16.7' },
  { version: '1.21.1',  label: '1.21.1 (Recommended 1.21)', java: 21, loader: '0.16.5' },
  { version: '1.21',    label: '1.21 (Tricky Trials)', java: 21, loader: '0.15.11' },
  { version: '1.20.6',  label: '1.20.6 (Stable)', java: 21, loader: '0.15.11' },
  { version: '1.20.4',  label: '1.20.4 (Popular)', java: 17, loader: '0.15.7' },
  { version: '1.20.2',  label: '1.20.2 (Stable)', java: 17, loader: '0.14.25' },
  { version: '1.20.1',  label: '1.20.1 (Golden Standard - Most Modded)', java: 17, loader: '0.15.11' },
  { version: '1.19.4',  label: '1.19.4 (Stable)', java: 17, loader: '0.14.19' },
  { version: '1.19.2',  label: '1.19.2 (Wild Update)', java: 17, loader: '0.14.9' },
  { version: '1.18.2',  label: '1.18.2 (Caves & Cliffs II)', java: 17, loader: '0.14.6' },
  { version: '1.17.1',  label: '1.17.1 (Caves & Cliffs I)', java: 16, loader: '0.11.6' },
  { version: '1.16.5',  label: '1.16.5 (Nether Classic)', java: 8, loader: '0.11.3' },
  { version: 'custom',  label: 'Custom Version (Type Any MC Version)...', java: 21, loader: '0.16.14' },
];

const FABRIC_LOADERS = [
  '0.19.5 (Latest)',
  '0.19.2',
  '0.19.0',
  '0.16.14',
  '0.16.12',
  '0.16.10',
  '0.16.9',
  '0.16.7',
  '0.16.5',
  '0.15.11 (Recommended)',
  '0.15.7',
  '0.14.25',
  '0.11.3',
  'custom',
];

export const ModGeneratorForm: React.FC<ModGeneratorFormProps> = ({
  onGenerate,
  isLoading,
  loadingStep,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedVersionOption, setSelectedVersionOption] = useState('1.21.11');
  const [customMcVersion, setCustomMcVersion] = useState('');
  const [selectedLoaderOption, setSelectedLoaderOption] = useState('0.19.5');
  const [customLoaderVersion, setCustomLoaderVersion] = useState('');
  const [modName, setModName] = useState('');
  const [modId, setModId] = useState('');
  const [modAuthor, setModAuthor] = useState('Minecraft Modder');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  const effectiveMcVersion = selectedVersionOption === 'custom'
    ? (customMcVersion.trim() || '1.21.11')
    : selectedVersionOption;

  const effectiveFabricVersion = selectedLoaderOption === 'custom'
    ? (customLoaderVersion.trim() || '0.16.14')
    : selectedLoaderOption.split(' ')[0];

  const currentMcMeta = MC_VERSIONS.find(v => v.version === effectiveMcVersion) || {
    version: effectiveMcVersion,
    label: effectiveMcVersion,
    java: effectiveMcVersion.startsWith('1.21') || effectiveMcVersion === '1.20.6' ? 21 : (effectiveMcVersion.startsWith('1.16') ? 8 : (effectiveMcVersion.startsWith('1.17') ? 16 : 17)),
    loader: effectiveFabricVersion,
  };

  const handleSelectPreset = (preset: PresetMod, index: number) => {
    setSelectedPresetIndex(index);
    setPrompt(preset.prompt);
    setSelectedVersionOption(preset.recommendedMc);
    const meta = MC_VERSIONS.find(v => v.version === preset.recommendedMc);
    if (meta) {
      setSelectedLoaderOption(meta.loader);
    }
  };

  const handleVersionOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVersionOption(val);
    const meta = MC_VERSIONS.find(v => v.version === val);
    if (meta && meta.version !== 'custom') {
      setSelectedLoaderOption(meta.loader);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    onGenerate({
      prompt: prompt.trim(),
      mcVersion: effectiveMcVersion,
      fabricVersion: effectiveFabricVersion,
      modName: modName.trim() || undefined,
      modId: modId.trim() || undefined,
      modAuthor: modAuthor.trim() || undefined,
    });
  };

  return (
    <div className="bg-[#10131d] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Natural Language Minecraft Mod Generator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Describe Your Minecraft Mod Idea
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Describe custom items, weapons, blocks, recipes, or mixin behaviors. We'll generate full Fabric Java code, 16x16 pixel textures, and assemble a valid, ready-to-play <span className="text-emerald-400 font-mono">.jar</span>.
        </p>
      </div>

      {/* Preset Inspiration Pills */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Quick Inspiration Presets</span>
          <span className="text-[11px] text-slate-500 font-normal">Click any idea to load</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MOD_PRESETS.map((preset, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleSelectPreset(preset, idx)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-[#151926] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#1a2030]'
                }`}
              >
                <div className="font-semibold text-white leading-tight mb-1 truncate w-full">
                  {preset.title}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  {preset.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Prompt Input */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Mod Description & Features
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setSelectedPresetIndex(null);
              }}
              rows={4}
              placeholder="e.g. Create a Ruby Armory mod with Ruby Swords, Pickaxes, and Armor. The sword deals high damage and ignites mobs. The pickaxe auto-smelts mined ores. Includes recipes crafting with raw ruby gems and sticks..."
              className="w-full bg-[#141824] border border-slate-700/80 rounded-xl p-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed transition-colors shadow-inner"
              required
            />
          </div>
        </div>

        {/* Version Matrix Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Minecraft Version */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Minecraft Java Edition</span>
              <span className="text-emerald-400 font-mono text-[11px]">Up to 1.21.11</span>
            </label>
            <select
              value={selectedVersionOption}
              onChange={handleVersionOptionChange}
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {MC_VERSIONS.map((v) => (
                <option key={v.version} value={v.version}>
                  {v.label}
                </option>
              ))}
            </select>
            {selectedVersionOption === 'custom' && (
              <input
                type="text"
                value={customMcVersion}
                onChange={(e) => setCustomMcVersion(e.target.value)}
                placeholder="e.g. 1.21.11, 1.21.12, 1.22..."
                className="mt-2 w-full bg-[#0d1017] border border-emerald-500/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            )}
          </div>

          {/* Fabric Loader Version */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Fabric Loader Version</span>
              <span className="text-slate-400 font-mono text-[11px]">0.16.14+</span>
            </label>
            <select
              value={selectedLoaderOption}
              onChange={(e) => setSelectedLoaderOption(e.target.value)}
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {FABRIC_LOADERS.map((loader) => (
                <option key={loader} value={loader === 'custom' ? 'custom' : loader.split(' ')[0]}>
                  {loader === 'custom' ? 'Custom Loader Version...' : loader}
                </option>
              ))}
            </select>
            {selectedLoaderOption === 'custom' && (
              <input
                type="text"
                value={customLoaderVersion}
                onChange={(e) => setCustomLoaderVersion(e.target.value)}
                placeholder="e.g. 0.16.14"
                className="mt-2 w-full bg-[#0d1017] border border-emerald-500/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            )}
          </div>

          {/* Java Level Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Java Runtime Target</span>
              <span className="text-purple-400 font-mono text-[11px]">Auto-Tuned</span>
            </label>
            <div className="bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 flex items-center justify-between">
              <span className="font-mono font-medium">Java {currentMcMeta.java}</span>
              <span className="text-[11px] text-slate-400">Bytecode Compatible</span>
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Advanced Options' : 'Custom Mod ID, Name & Author'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-[#141824] border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Custom Mod Name (Optional)</label>
                <input
                  type="text"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  placeholder="e.g. Ruby Armory"
                  className="w-full bg-[#0d1017] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Custom Mod ID (snake_case)</label>
                <input
                  type="text"
                  value={modId}
                  onChange={(e) => setModId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. ruby_armory"
                  className="w-full bg-[#0d1017] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Author Name</label>
                <input
                  type="text"
                  value={modAuthor}
                  onChange={(e) => setModAuthor(e.target.value)}
                  placeholder="e.g. Minecraft Modder"
                  className="w-full bg-[#0d1017] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl ${
              isLoading || !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-500/20 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-mono text-sm">{loadingStep || 'Forging Fabric Mod...'}</span>
              </>
            ) : (
              <>
                <Hammer className="w-5 h-5 text-emerald-300" />
                <span>Forge Fabric Mod & Build .JAR</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
