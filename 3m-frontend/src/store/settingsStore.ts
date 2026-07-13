import { create } from 'zustand';
import { settingsService } from '../services/settingsService';
import type { IStoreSettings } from '../services/settingsService';

interface SettingsState {
  settings: IStoreSettings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<IStoreSettings | null>;
  updateSettings: (newSettings: Partial<IStoreSettings>) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await settingsService.getSettings();
      set({ settings: data, isLoading: false });
      return data;
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      set({ isLoading: false });
      return null;
    }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true });
    try {
      const updated = await settingsService.updateSettings(newSettings);
      set({ settings: updated, isLoading: false });
      return true;
    } catch (err) {
      console.error('Failed to update settings:', err);
      set({ isLoading: false });
      return false;
    }
  }
}));
