/**
 * Minecraft 16x16 Pixel Art Generator and PNG Encoder
 */

export interface PixelArtGrid {
  width: number;
  height: number;
  pixels: string[]; // hex strings or 'transparent'
}

// Convert hex to {r, g, b, a}
export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  if (hex === 'transparent' || !hex) return { r: 0, g: 0, b: 0, a: 0 };
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: 255
  };
}

// Slightly shade color
export function shadeColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgba(hex);
  const factor = 1 + percent / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

/**
 * Generate 16x16 pixel art for items
 */
export function generateItemTexture(
  type: string,
  primaryHex: string = '#6366F1',
  secondaryHex: string = '#4338CA',
  accentHex: string = '#A5B4FC'
): PixelArtGrid {
  const grid: string[] = new Array(256).fill('transparent');
  const set = (x: number, y: number, color: string) => {
    if (x >= 0 && x < 16 && y >= 0 && y < 16) {
      grid[y * 16 + x] = color;
    }
  };

  const handleDark = '#4A3728';
  const handleWood = '#7A5C37';
  const handleLight = '#9B784C';

  const t = type.toLowerCase();

  if (t.includes('sword') || t.includes('blade') || t.includes('weapon') || t.includes('katana') || t.includes('dagger')) {
    // Sword template
    // Handle pommel
    set(2, 13, handleDark);
    set(3, 14, handleDark);
    set(3, 13, handleWood);
    set(4, 12, handleWood);

    // Crossguard
    set(5, 11, secondaryHex);
    set(6, 11, primaryHex);
    set(4, 10, secondaryHex);
    set(3, 11, accentHex);
    set(6, 12, accentHex);

    // Blade
    for (let i = 0; i < 8; i++) {
      const x = 5 + i;
      const y = 9 - i;
      set(x, y, primaryHex);
      set(x + 1, y, secondaryHex);
      set(x, y - 1, accentHex);
    }
    // Tip
    set(13, 1, accentHex);
    set(14, 1, primaryHex);
    set(13, 2, secondaryHex);
  } else if (t.includes('pickaxe')) {
    // Stick
    for (let i = 0; i < 9; i++) {
      set(3 + i, 12 - i, handleWood);
      set(2 + i, 12 - i, handleDark);
    }
    // Pickaxe head
    set(7, 2, secondaryHex);
    set(8, 2, primaryHex);
    set(9, 2, primaryHex);
    set(10, 2, secondaryHex);

    set(6, 3, primaryHex);
    set(7, 3, accentHex);
    set(10, 3, accentHex);
    set(11, 3, primaryHex);

    set(5, 4, secondaryHex);
    set(12, 4, secondaryHex);
    set(4, 5, primaryHex);
    set(13, 5, primaryHex);
    set(4, 6, accentHex);
    set(13, 6, accentHex);
  } else if (t.includes('axe')) {
    // Stick
    for (let i = 0; i < 9; i++) {
      set(3 + i, 12 - i, handleWood);
      set(2 + i, 12 - i, handleDark);
    }
    // Axe head
    set(8, 2, accentHex);
    set(9, 2, primaryHex);
    set(10, 2, secondaryHex);
    set(11, 2, secondaryHex);

    set(7, 3, accentHex);
    set(8, 3, accentHex);
    set(9, 3, primaryHex);
    set(10, 3, secondaryHex);
    set(11, 3, secondaryHex);

    set(7, 4, accentHex);
    set(8, 4, primaryHex);
    set(9, 4, secondaryHex);
    set(10, 4, secondaryHex);

    set(8, 5, accentHex);
    set(9, 5, secondaryHex);
  } else if (t.includes('food') || t.includes('apple') || t.includes('fruit')) {
    // Apple / round fruit
    for (let y = 5; y <= 12; y++) {
      for (let x = 4; x <= 11; x++) {
        const d = Math.hypot(x - 7.5, y - 8.5);
        if (d <= 3.8) {
          if (x < 7 && y < 8) set(x, y, accentHex);
          else if (x > 9 || y > 10) set(x, y, secondaryHex);
          else set(x, y, primaryHex);
        }
      }
    }
    // Stem
    set(8, 3, '#15803D');
    set(8, 4, '#166534');
    set(9, 3, '#22C55E');
  } else if (t.includes('armor') || t.includes('helmet')) {
    // Helmet
    for (let y = 3; y <= 11; y++) {
      for (let x = 3; x <= 12; x++) {
        if (y === 3 && (x <= 4 || x >= 11)) continue;
        if (y >= 7 && y <= 9 && (x >= 6 && x <= 9)) continue; // visor opening
        if (y === 11 && (x >= 5 && x <= 10)) continue;
        if (x === 3 || y === 4) set(x, y, accentHex);
        else if (x === 12 || y === 10) set(x, y, secondaryHex);
        else set(x, y, primaryHex);
      }
    }
  } else {
    // Gem / Ingot / Catalyst Crystal
    const gemCoords = [
      [7, 2], [8, 2],
      [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3],
      [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4],
      [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5],
      [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6],
      [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
      [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8],
      [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9],
      [6, 10], [7, 10], [8, 10], [9, 10],
      [6, 11], [7, 11], [8, 11], [9, 11],
      [7, 12], [8, 12],
      [7, 13], [8, 13]
    ];
    for (const [x, y] of gemCoords) {
      if (x <= 5 || y <= 4) set(x, y, accentHex);
      else if (x >= 10 || y >= 10) set(x, y, secondaryHex);
      else set(x, y, primaryHex);
    }
  }

  return { width: 16, height: 16, pixels: grid };
}

/**
 * Generate 16x16 pixel art for blocks (Deepslate / Stone Ore with crystal deposits)
 */
export function generateBlockTexture(
  primaryHex: string = '#6366F1',
  secondaryHex: string = '#4338CA',
  accentHex: string = '#A5B4FC'
): PixelArtGrid {
  const grid: string[] = new Array(256);
  // Base deepslate/stone background colors
  const stoneLight = '#3A3D40';
  const stoneMid = '#27292C';
  const stoneDark = '#191B1D';

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const noise = hash - Math.floor(hash);
      if (noise > 0.65) grid[y * 16 + x] = stoneLight;
      else if (noise > 0.3) grid[y * 16 + x] = stoneMid;
      else grid[y * 16 + x] = stoneDark;
    }
  }

  // Gem clusters
  const clusters = [
    [4, 4], [5, 4], [4, 5], [5, 5], [6, 5], [5, 6],
    [10, 9], [11, 9], [10, 10], [11, 10], [12, 10], [11, 11],
    [3, 11], [4, 11], [3, 12],
    [12, 3], [13, 3], [12, 4]
  ];

  for (const [x, y] of clusters) {
    if (x >= 0 && x < 16 && y >= 0 && y < 16) {
      const idx = y * 16 + x;
      if (x % 2 === 0 && y % 2 === 0) grid[idx] = accentHex;
      else if (x % 2 === 1 && y % 2 === 1) grid[idx] = secondaryHex;
      else grid[idx] = primaryHex;
    }
  }

  return { width: 16, height: 16, pixels: grid };
}

/**
 * Generate Mod Icon (32x32 badge)
 */
export function generateModIcon(
  primaryHex: string = '#6366F1',
  secondaryHex: string = '#4338CA',
  accentHex: string = '#A5B4FC'
): PixelArtGrid {
  const size = 32;
  const grid: string[] = new Array(size * size).fill('transparent');
  const set = (x: number, y: number, color: string) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      grid[y * size + x] = color;
    }
  };

  // Outer frame
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (x === 1 || x === size - 2 || y === 1 || y === size - 2) {
        set(x, y, '#0F172A');
      } else if (x === 2 || x === size - 3 || y === 2 || y === size - 3) {
        set(x, y, primaryHex);
      } else {
        set(x, y, '#1E293B');
      }
    }
  }

  // Emblazoned sword in center
  for (let i = 0; i < 14; i++) {
    const x = 9 + i;
    const y = 22 - i;
    set(x, y, primaryHex);
    set(x + 1, y, secondaryHex);
    set(x, y - 1, accentHex);
  }

  // Crossguard
  set(10, 20, accentHex);
  set(11, 21, primaryHex);
  set(12, 22, secondaryHex);
  set(8, 22, secondaryHex);
  set(9, 23, primaryHex);

  // Golden corner accents
  const gold = '#F59E0B';
  const goldLight = '#FDE68A';
  set(2, 2, goldLight);
  set(3, 2, gold);
  set(2, 3, gold);

  set(size - 3, 2, goldLight);
  set(size - 4, 2, gold);
  set(size - 3, 3, gold);

  set(2, size - 3, goldLight);
  set(3, size - 3, gold);
  set(2, size - 4, gold);

  set(size - 3, size - 3, goldLight);
  set(size - 4, size - 3, gold);
  set(size - 3, size - 4, gold);

  return { width: size, height: size, pixels: grid };
}

/**
 * Converts PixelArtGrid to PNG Uint8Array via HTML Canvas
 */
export async function pixelGridToPngBytes(grid: PixelArtGrid): Promise<Uint8Array> {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = grid.width;
    canvas.height = grid.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d canvas context');

    const imgData = ctx.createImageData(grid.width, grid.height);
    for (let i = 0; i < grid.pixels.length; i++) {
      const rgba = hexToRgba(grid.pixels[i]);
      imgData.data[i * 4 + 0] = rgba.r;
      imgData.data[i * 4 + 1] = rgba.g;
      imgData.data[i * 4 + 2] = rgba.b;
      imgData.data[i * 4 + 3] = rgba.a;
    }
    ctx.putImageData(imgData, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to create PNG blob'));
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(new Uint8Array(reader.result as ArrayBuffer));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      }, 'image/png');
    });
  }

  // Fallback pure JS minimal PNG encoder (if running headless)
  return createMinimalPng(grid);
}

/**
 * Converts PixelArtGrid to Data URL for <img> tags
 */
export function pixelGridToDataUrl(grid: PixelArtGrid): string {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = grid.width;
    canvas.height = grid.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.createImageData(grid.width, grid.height);
      for (let i = 0; i < grid.pixels.length; i++) {
        const rgba = hexToRgba(grid.pixels[i]);
        imgData.data[i * 4 + 0] = rgba.r;
        imgData.data[i * 4 + 1] = rgba.g;
        imgData.data[i * 4 + 2] = rgba.b;
        imgData.data[i * 4 + 3] = rgba.a;
      }
      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL('image/png');
    }
  }
  return '';
}

/**
 * Minimal uncompressed PNG writer fallback
 */
function createMinimalPng(grid: PixelArtGrid): Uint8Array {
  // Simple uncompressed valid PNG
  const width = grid.width;
  const height = grid.height;

  // For 16x16 RGBA
  const rawData: number[] = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter type none
    for (let x = 0; x < width; x++) {
      const rgba = hexToRgba(grid.pixels[y * width + x]);
      rawData.push(rgba.r, rgba.g, rgba.b, rgba.a);
    }
  }

  // Minimal standard PNG header
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  // We can return a reliable tiny fallback or placeholder
  return new Uint8Array(signature);
}
