import { api } from './api';

export interface IStoreSettings {
  maintenanceMode: boolean;
  announcement: {
    show: boolean;
    textAr: string;
    textEn: string;
    bgColor: string;
    textColor: string;
  };
  shippingFees: {
    cairoGiza: number;
    alexDelta: number;
    other: number;
  };
  contactInfo: {
    phone: string;
    email: string;
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
  logoUrl: string;
}

export const settingsService = {
  getSettings: async (): Promise<IStoreSettings> => {
    const response = await api.get<{ message: string; data: IStoreSettings }>('/settings');
    return response.data.data;
  },

  updateSettings: async (settings: Partial<IStoreSettings>): Promise<IStoreSettings> => {
    const response = await api.put<{ message: string; data: IStoreSettings }>('/settings', settings);
    return response.data.data;
  }
};
