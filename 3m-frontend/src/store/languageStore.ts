import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (lang) => {
        set({ language: lang });
        if (typeof window !== 'undefined') {
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
      },
    }),
    {
      name: '3m-language-storage',
    }
  )
);
