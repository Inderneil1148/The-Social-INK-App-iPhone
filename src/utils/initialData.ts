import { Brand, ContentItem } from '../types/content';

// Database initialized to completely blank state (0 brands, 0 content items)
export const INITIAL_BRANDS: Brand[] = [];
export const INITIAL_CONTENT_ITEMS: ContentItem[] = [];

export const STORAGE_KEY_BRANDS = 'brandpulse_brands_clean_v1';
export const STORAGE_KEY_CONTENT = 'brandpulse_content_clean_v1';

export function loadSavedBrands(): Brand[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRANDS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored brands:', e);
  }
  return [];
}

export function loadSavedContent(): ContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTENT);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored content:', e);
  }
  return [];
}

export function saveBrandsToStorage(brands: Brand[]) {
  try {
    localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
  } catch (e) {
    console.error('Error saving brands:', e);
  }
}

export function saveContentToStorage(items: ContentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving content items:', e);
  }
}
