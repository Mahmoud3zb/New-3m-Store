import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { ICategory } from '../../../types';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, name: string, description: string) => void;
  isSubmitting: boolean;
  editingCategory: ICategory | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingCategory,
}) => {
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const { language } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    if (editingCategory) {
      setCatName(editingCategory.name);
      setCatDesc(editingCategory.description || '');
    } else {
      setCatName('');
      setCatDesc('');
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, catName, catDesc);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h3 className="text-sm font-bold text-neutral-800">
            {editingCategory ? t.adminModalEditCategory : t.adminModalAddCategory}
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 space-y-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelCategoryName}</label>
            <input 
              type="text" 
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 ${language === 'ar' ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelCategoryDesc}</label>
            <textarea 
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              rows={3}
              className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 resize-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {t.adminUserCancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t.adminModalSaveCategory}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
