import React from 'react';
import { Plus, Loader2, Tag, Edit, Trash2 } from 'lucide-react';
import type { ICategory } from '../../../types';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

interface CategoriesTabProps {
  categories: ICategory[];
  loadingCategories: boolean;
  onAddClick: () => void;
  onEditClick: (category: ICategory) => void;
  onDeleteClick: (category: ICategory) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  loadingCategories,
  onAddClick,
  onEditClick,
  onDeleteClick,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-800">{t.adminCategoriesTitle}</h2>
          <p className="text-xs text-neutral-400">{t.adminCategoriesSubtitle}</p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t.adminAddCategoryBtn}
        </button>
      </div>

      {loadingCategories ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
          <p className="text-xs text-neutral-400 font-bold">{t.adminCategoryLoadingList}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center shadow-sm space-y-3">
          <Tag className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-xs text-neutral-400">{t.adminCategoryNoCategories}</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="p-4 md:p-5">{t.adminCategoryThName}</th>
                  <th className="p-4 md:p-5">{t.adminCategoryThDesc}</th>
                  <th className="p-4 md:p-5 text-center">{t.adminProductThActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="p-4 md:p-5 font-bold text-neutral-800">{category.name}</td>
                    <td className="p-4 md:p-5 text-neutral-500 font-medium">{category.description || t.adminCategoryNoDesc}</td>
                    <td className="p-4 md:p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditClick(category)}
                          className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 hover:text-black transition-colors cursor-pointer"
                          title={t.adminCategoryEditTooltip}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(category)}
                          className="p-2 hover:bg-red-50 rounded-xl text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          title={t.adminCategoryDeleteTooltip}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
