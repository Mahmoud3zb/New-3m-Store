import React from 'react';
import { Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: 'product' | 'category';
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  type,
  name,
  onClose,
  onConfirm,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  if (!isOpen) return null;

  const translatedType = type === 'product' ? t.adminModalDeleteProductType : t.adminModalDeleteCategoryType;
  const descText = t.adminModalDeleteConfirmDesc
    .replace('{type}', translatedType)
    .replace('{name}', name);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-6">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <Trash2 className="w-5 h-5" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-neutral-800">{t.adminModalDeleteConfirmTitle}</h3>
          <p className={`text-xs text-neutral-400 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {descText}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            {t.adminModalDeleteConfirmCancel}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-red-100"
          >
            {t.adminModalDeleteConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
