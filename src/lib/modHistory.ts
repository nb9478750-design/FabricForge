import { ModProject } from './modPackager.ts';

export interface HistoryItem {
  id: string;
  createdAt: string;
  prompt: string;
  mod: ModProject;
}

const STORAGE_KEY = 'fabricforge_mod_history_v1';

export function getModHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load mod history:', e);
    return [];
  }
}

export function saveModToHistory(mod: ModProject, prompt: string): HistoryItem {
  const history = getModHistory();
  const newItem: HistoryItem = {
    id: `${mod.modId}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    prompt,
    mod,
  };

  // Prepend new item and avoid duplicates of same modId if identical
  const filtered = history.filter(h => h.id !== newItem.id && !(h.mod.modId === mod.modId && h.createdAt === newItem.createdAt));
  // Keep up to 50 most recent mods
  const updated = [newItem, ...filtered].slice(0, 50);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save to localStorage (maybe quota exceeded):', e);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const history = getModHistory();
  const updated = history.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update history:', e);
  }
  return updated;
}

export function clearModHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}
