import React, { useState } from 'react';
import { ModItem, ModBlock, ModRecipe, ModProject } from '../lib/modPackager.ts';
import { pixelGridToDataUrl, generateItemTexture, generateBlockTexture } from '../lib/textureGenerator.ts';
import { Sparkles, Hammer, Shield, Layers, Sword, Package } from 'lucide-react';

interface MinecraftPreviewProps {
  mod: ModProject;
  activeItem?: ModItem;
  onSelectItem?: (item: ModItem) => void;
}

export const MinecraftPreview: React.FC<MinecraftPreviewProps> = ({
  mod,
  activeItem,
  onSelectItem,
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const currentItem = activeItem || mod.items[selectedSlotIndex] || mod.items[0];

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toUpperCase()) {
      case 'EPIC': return 'text-[#d946ef]'; // Magenta
      case 'RARE': return 'text-[#38bdf8]'; // Aqua
      case 'UNCOMMON': return 'text-[#facc15]'; // Yellow
      default: return 'text-white';
    }
  };

  const getTextureUrl = (item: ModItem) => {
    const grid = item.customGrid || generateItemTexture(
      item.type,
      item.palette?.primaryColor || '#6366F1',
      item.palette?.secondaryColor || '#4338CA',
      item.palette?.accentColor || '#A5B4FC'
    );
    return pixelGridToDataUrl(grid);
  };

  const getBlockTextureUrl = (block: ModBlock) => {
    const grid = block.customGrid || generateBlockTexture(
      block.palette?.primaryColor || '#6366F1',
      block.palette?.secondaryColor || '#4338CA',
      block.palette?.accentColor || '#A5B4FC'
    );
    return pixelGridToDataUrl(grid);
  };

  // Find recipe for current item
  const itemRecipe = mod.recipes.find(r => r.result.includes(currentItem?.id || ''));

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121622] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sword className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Registered Items</div>
            <div className="text-xl font-bold text-white font-mono">{mod.items.length} Custom Items</div>
            <div className="text-xs text-emerald-400">Fabric Item Registry</div>
          </div>
        </div>

        <div className="bg-[#121622] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Registered Blocks</div>
            <div className="text-xl font-bold text-white font-mono">{(mod.blocks || []).length} Custom Blocks</div>
            <div className="text-xs text-cyan-400">Block Registry + States</div>
          </div>
        </div>

        <div className="bg-[#121622] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Crafting Recipes</div>
            <div className="text-xl font-bold text-white font-mono">{mod.recipes.length} Recipe JSONs</div>
            <div className="text-xs text-purple-400">Data Pack Loaded</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Minecraft Item Showcase & In-Game Tooltip */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121622] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                In-Game HUD & Tooltip Simulation
              </h3>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                Minecraft {mod.minecraftVersion}
              </span>
            </div>

            {/* Showcase Stage */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#181d2a] to-[#0c0f17] border-2 border-[#2b3346] p-8 flex flex-col items-center justify-center min-h-[300px]">
              {/* Radial glow */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none blur-3xl"
                style={{
                  background: `radial-gradient(circle at center, ${currentItem?.palette?.primaryColor || '#6366F1'} 0%, transparent 70%)`,
                }}
              />

              {/* Item Showcase icon with floating bounce */}
              {currentItem && (
                <div className="relative flex flex-col items-center group">
                  <div className="w-32 h-32 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                    <img
                      src={getTextureUrl(currentItem)}
                      alt={currentItem.name}
                      className="w-28 h-28 [image-rendering:pixelated] select-none"
                    />
                  </div>
                </div>
              )}

              {/* Minecraft Styled Tooltip (authentic Minecraft GUI look) */}
              {currentItem && (
                <div className="mt-6 z-10 bg-[#100010]/95 border-2 border-[#26005c] rounded px-4 py-3 shadow-[0_0_20px_rgba(38,0,92,0.6)] font-mono text-sm max-w-sm w-full">
                  <div className={`font-bold text-base ${getRarityColor(currentItem.rarity)}`}>
                    {currentItem.name}
                  </div>
                  {currentItem.lore && (
                    <div className="text-[#a855f7] italic text-xs mt-1">
                      {currentItem.lore}
                    </div>
                  )}

                  {currentItem.attributes && (
                    <div className="mt-2.5 pt-2 border-t border-purple-900/50 space-y-0.5 text-xs">
                      {currentItem.attributes.attackDamage && (
                        <div className="text-[#22c55e]">
                          +{currentItem.attributes.attackDamage} Attack Damage
                        </div>
                      )}
                      {currentItem.attributes.attackSpeed && (
                        <div className="text-[#22c55e]">
                          {currentItem.attributes.attackSpeed} Attack Speed
                        </div>
                      )}
                      {currentItem.attributes.durability && (
                        <div className="text-[#94a3b8]">
                          Durability: {currentItem.attributes.durability} / {currentItem.attributes.durability}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    {mod.modId}:{currentItem.id}
                  </div>
                </div>
              )}
            </div>

            {/* Minecraft Hotbar Selector */}
            <div className="mt-6">
              <div className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">
                Minecraft Inventory Hotbar Preview (Click to Inspect)
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-[#2a2c30] border-4 border-[#1f2124] rounded-lg shadow-xl overflow-x-auto">
                {mod.items.map((item, idx) => {
                  const isSelected = item.id === currentItem?.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotIndex(idx);
                        if (onSelectItem) onSelectItem(item);
                      }}
                      className={`relative w-12 h-12 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff] flex items-center justify-center transition-all ${
                        isSelected ? 'ring-2 ring-emerald-400 scale-105 z-10' : 'hover:brightness-110'
                      }`}
                    >
                      <img
                        src={getTextureUrl(item)}
                        alt={item.name}
                        className="w-8 h-8 [image-rendering:pixelated]"
                      />
                      <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] font-mono">
                        1
                      </span>
                    </button>
                  );
                })}
                {/* Empty slots for visual authenticity */}
                {Array.from({ length: Math.max(0, 9 - mod.items.length) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-12 h-12 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff] opacity-70"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Crafting Table Simulator & Blocks */}
        <div className="lg:col-span-5 space-y-6">
          {/* Crafting Grid */}
          <div className="bg-[#121622] border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <Hammer className="w-4 h-4 text-emerald-400" />
              Crafting Table (3x3 Grid)
            </h3>

            {itemRecipe ? (
              <div className="p-4 bg-[#c6c6c6] border-4 border-t-[#ffffff] border-l-[#ffffff] border-b-[#555555] border-r-[#555555] rounded shadow-lg text-slate-800">
                <div className="flex items-center justify-center gap-4">
                  {/* 3x3 Grid */}
                  <div className="grid grid-cols-3 gap-1 bg-[#8b8b8b] p-1 border-2 border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff]">
                    {Array.from({ length: 9 }).map((_, slotIdx) => {
                      const row = Math.floor(slotIdx / 3);
                      const col = slotIdx % 3;
                      const patternRow = itemRecipe.pattern ? itemRecipe.pattern[row] : '';
                      const char = patternRow ? patternRow[col] : ' ';
                      const keyDef = itemRecipe.key?.find(k => k.symbol === char);

                      return (
                        <div
                          key={slotIdx}
                          className="w-10 h-10 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff] flex items-center justify-center relative group"
                        >
                          {keyDef && (
                            <span className="text-[10px] font-bold text-white bg-black/40 px-1 rounded font-mono truncate max-w-full">
                              {keyDef.symbol}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Arrow */}
                  <div className="text-2xl font-bold text-slate-700">➜</div>

                  {/* Result Slot */}
                  <div className="w-14 h-14 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff] flex items-center justify-center relative">
                    {currentItem && (
                      <img
                        src={getTextureUrl(currentItem)}
                        alt={currentItem.name}
                        className="w-10 h-10 [image-rendering:pixelated]"
                      />
                    )}
                    <span className="absolute bottom-1 right-1 text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] font-mono">
                      {itemRecipe.count || 1}
                    </span>
                  </div>
                </div>

                {/* Recipe Legend */}
                <div className="mt-4 pt-3 border-t border-slate-400 text-xs text-slate-700">
                  <div className="font-bold mb-1">Recipe Keys:</div>
                  <div className="space-y-1 font-mono">
                    {itemRecipe.key?.map((k, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="bg-slate-700 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                          {k.symbol}
                        </span>
                        <span className="text-slate-900 truncate">{k.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#181d2a] rounded-lg border border-slate-700 text-center text-slate-400 text-sm">
                No crafting recipe defined for this item, or it drops from blocks/entities.
              </div>
            )}
          </div>

          {/* Custom Blocks Preview */}
          {mod.blocks && mod.blocks.length > 0 && (
            <div className="bg-[#121622] border border-slate-800 rounded-xl p-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-cyan-400" />
                Custom Blocks & Ores
              </h3>
              <div className="space-y-3">
                {mod.blocks.map(block => (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 p-3 bg-[#181d2b] rounded-lg border border-slate-700"
                  >
                    <img
                      src={getBlockTextureUrl(block)}
                      alt={block.name}
                      className="w-12 h-12 [image-rendering:pixelated] rounded border border-slate-600 bg-[#0a0c12]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{block.name}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        Hardness: {block.hardness} | Tool: {block.toolType}
                      </div>
                      <div className="text-[11px] text-cyan-400 font-mono">
                        {mod.modId}:{block.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
