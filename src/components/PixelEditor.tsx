import React, { useState, useRef, useEffect } from 'react';
import { PixelArtGrid, hexToRgba, pixelGridToDataUrl } from '../lib/textureGenerator.ts';
import { Paintbrush, Eraser, RotateCcw, Palette, Check, Sparkles } from 'lucide-react';

interface PixelEditorProps {
  initialGrid: PixelArtGrid;
  title: string;
  onSave: (newGrid: PixelArtGrid) => void;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

const DEFAULT_PALETTE = [
  '#E11D48', '#BE123C', '#881337', // Ruby / Crimson
  '#06B6D4', '#0891B2', '#164E63', // Diamond / Cyan
  '#10B981', '#059669', '#064E3B', // Emerald
  '#F59E0B', '#D97706', '#78350F', // Gold
  '#8B5CF6', '#7C3AED', '#4C1D95', // Amethyst / Void
  '#6366F1', '#4F46E5', '#312E81', // Lapis / Cobalt
  '#64748B', '#334155', '#0F172A', // Netherite / Stone
  '#7A5C37', '#4A3728', '#2B1E14', // Wood / Leather
  '#FFFFFF', '#D1D5DB', '#000000', // Monochrome
];

export const PixelEditor: React.FC<PixelEditorProps> = ({
  initialGrid,
  title,
  onSave,
  primaryColor = '#6366F1',
  secondaryColor = '#4338CA',
  accentColor = '#A5B4FC',
}) => {
  const [grid, setGrid] = useState<PixelArtGrid>({
    width: initialGrid.width || 16,
    height: initialGrid.height || 16,
    pixels: [...initialGrid.pixels],
  });

  const [selectedColor, setSelectedColor] = useState<string>(primaryColor);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const palette = [
    primaryColor,
    secondaryColor,
    accentColor,
    ...DEFAULT_PALETTE.filter(c => c !== primaryColor && c !== secondaryColor && c !== accentColor),
  ];

  useEffect(() => {
    setGrid({
      width: initialGrid.width || 16,
      height: initialGrid.height || 16,
      pixels: [...initialGrid.pixels],
    });
  }, [initialGrid]);

  useEffect(() => {
    setPreviewUrl(pixelGridToDataUrl(grid));
  }, [grid]);

  const applyColor = (x: number, y: number) => {
    if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return;
    const index = y * grid.width + x;
    const newPixels = [...grid.pixels];
    const colorToApply = tool === 'pen' ? selectedColor : 'transparent';
    if (newPixels[index] === colorToApply) return;
    newPixels[index] = colorToApply;
    const updated = { ...grid, pixels: newPixels };
    setGrid(updated);
    onSave(updated);
  };

  const handleCellClick = (x: number, y: number) => {
    applyColor(x, y);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (isMouseDown) {
      applyColor(x, y);
    }
  };

  const handleReset = () => {
    setGrid({
      width: initialGrid.width,
      height: initialGrid.height,
      pixels: [...initialGrid.pixels],
    });
    onSave(initialGrid);
  };

  return (
    <div className="bg-[#12151e] border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          <h4 className="font-semibold text-white text-sm">{title} (16x16 Texture)</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1a1f2e] p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
                tool === 'pen' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Draw
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
                tool === 'eraser' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              Erase
            </button>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to generated"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-center">
        {/* Pixel Canvas Grid */}
        <div
          className="relative select-none p-2 bg-[#0a0d14] rounded-lg border-2 border-slate-700 shadow-inner"
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
        >
          <div
            className="grid gap-[1px] bg-slate-800/60 p-[1px]"
            style={{
              gridTemplateColumns: `repeat(${grid.width}, minmax(0, 1fr))`,
              width: grid.width === 32 ? '288px' : '256px',
              height: grid.height === 32 ? '288px' : '256px',
            }}
          >
            {grid.pixels.map((color, idx) => {
              const x = idx % grid.width;
              const y = Math.floor(idx / grid.width);
              const isTransparent = color === 'transparent' || !color;
              return (
                <div
                  key={idx}
                  onMouseDown={() => handleCellClick(x, y)}
                  onMouseEnter={() => handleMouseEnter(x, y)}
                  style={{ backgroundColor: isTransparent ? undefined : color }}
                  className={`w-full h-full cursor-crosshair transition-transform active:scale-90 ${
                    isTransparent
                      ? (x + y) % 2 === 0
                        ? 'bg-[#181d28]'
                        : 'bg-[#222938]'
                      : ''
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Controls & Previews */}
        <div className="flex flex-col gap-4 w-full sm:w-48">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Preview Scale
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#181e2b] rounded-lg border border-slate-700">
              {previewUrl && (
                <>
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={previewUrl}
                      alt="1x"
                      className="w-8 h-8 [image-rendering:pixelated] rounded border border-slate-600 bg-[#0a0c12]"
                    />
                    <span className="text-[10px] text-slate-400">1x</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={previewUrl}
                      alt="2x"
                      className="w-12 h-12 [image-rendering:pixelated] rounded border border-slate-600 bg-[#0a0c12]"
                    />
                    <span className="text-[10px] text-slate-400">2x</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={previewUrl}
                      alt="4x"
                      className="w-16 h-16 [image-rendering:pixelated] rounded border border-slate-600 bg-[#0a0c12]"
                    />
                    <span className="text-[10px] text-slate-400">4x</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Palette */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Palette
              </span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                title="Custom Color"
              />
            </div>
            <div className="grid grid-cols-6 gap-1.5 p-2 bg-[#181e2b] rounded-lg border border-slate-700">
              {palette.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedColor(hex);
                    setTool('pen');
                  }}
                  style={{ backgroundColor: hex }}
                  className={`w-6 h-6 rounded border transition-transform hover:scale-110 flex items-center justify-center ${
                    selectedColor.toLowerCase() === hex.toLowerCase() && tool === 'pen'
                      ? 'border-white ring-2 ring-emerald-500 scale-105'
                      : 'border-black/30'
                  }`}
                >
                  {selectedColor.toLowerCase() === hex.toLowerCase() && tool === 'pen' && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
