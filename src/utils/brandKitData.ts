import { ClientBrandKit } from '../types/brandKit';

export const BRAND_KIT_STORAGE_KEY = 'the_social_brand_kit_clients_clean_v1';
export const ACTIVE_CLIENT_STORAGE_KEY = 'the_social_brand_kit_active_client_clean_v1';

// Entire database wiped clean - zero brand kits by default
export const INITIAL_CLIENT_KITS: ClientBrandKit[] = [];

export const loadStoredClientKits = (): ClientBrandKit[] => {
  try {
    const raw = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored brand kits:', err);
  }
  return [];
};

export const saveClientKits = (kits: ClientBrandKit[]): void => {
  try {
    localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(kits));
  } catch (err) {
    console.error('Failed to save brand kits to localStorage:', err);
  }
};

export const loadActiveClientId = (kits: ClientBrandKit[]): string => {
  try {
    const stored = localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY);
    if (stored && kits.some((k) => k.id === stored)) {
      return stored;
    }
  } catch (err) {
    console.warn('Could not read active client ID:', err);
  }
  return kits[0]?.id || '';
};

export const saveActiveClientId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, id);
  } catch (err) {
    console.error('Failed to save active client ID:', err);
  }
};

export const clearAllStudioData = (): void => {
  try {
    localStorage.removeItem(BRAND_KIT_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CLIENT_STORAGE_KEY);
    localStorage.removeItem('the_social_brand_kit_clients_v2');
    localStorage.removeItem('the_social_brand_kit_active_client_id');
    localStorage.removeItem('brandpulse_brands_v1');
    localStorage.removeItem('brandpulse_content_v1');
    localStorage.removeItem('brandpulse_brands_clean_v1');
    localStorage.removeItem('brandpulse_content_clean_v1');
  } catch (err) {
    console.error('Failed to clear studio data:', err);
  }
};
