import React from 'react';
import { Plus, Loader2, Package, Edit, Trash2 } from 'lucide-react';
import type { IProduct } from '../../../types';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

interface ProductsTabProps {
  products: IProduct[];
  loadingProducts: boolean;
  onAddClick: () => void;
  onEditClick: (product: IProduct) => void;
  onDeleteClick: (product: IProduct) => void;
  formatPrice: (price: number) => string;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  loadingProducts,
  onAddClick,
  onEditClick,
  onDeleteClick,
  formatPrice,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-800">{t.adminProductsTitle}</h2>
          <p className="text-xs text-neutral-400">{t.adminProductsSubtitle}</p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t.adminAddProductBtn}
        </button>
      </div>

      {loadingProducts ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
          <p className="text-xs text-neutral-400 font-bold">{t.adminProductLoadingList}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center shadow-sm space-y-3">
          <Package className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-xs text-neutral-400">{t.adminProductNoProducts}</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="p-4 md:p-5">{t.adminProductThProduct}</th>
                  <th className="p-4 md:p-5">{t.adminProductThCategory}</th>
                  <th className="p-4 md:p-5">{t.adminProductThPrice}</th>
                  <th className="p-4 md:p-5">{t.adminProductThQuantity}</th>
                  <th className="p-4 md:p-5 text-center">{t.adminProductThActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {products.map((product) => {
                  const categoryName = typeof product.categoryID === 'object' && product.categoryID 
                    ? (product.categoryID as any).name 
                    : (language === 'ar' ? 'مجموعة غير محددة' : 'General Collection');

                  return (
                    <tr key={product._id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="p-4 md:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-100 flex-shrink-0">
                            <img 
                              src={product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                              alt="product cover" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-neutral-800 block">{product.name}</span>
                            <span className="text-[10px] text-neutral-400 line-clamp-1 max-w-[180px] font-medium">{product.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <span className="bg-neutral-50 text-neutral-600 px-2.5 py-1 rounded-lg border border-neutral-100/50 font-bold text-[10px]">
                          {categoryName}
                        </span>
                      </td>
                      <td className="p-4 md:p-5 font-bold text-neutral-800 font-serif-en" dir="ltr">{formatPrice(product.price)}</td>
                      <td className="p-4 md:p-5 font-bold text-neutral-500 font-serif-en">
                        {(() => {
                          const totalQty = (product.variants || []).reduce((sum, v) => sum + v.quantity, 0);
                          if (totalQty === 0) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[9px] text-red-650 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full font-bold">
                                {language === 'ar' ? 'نفذ المخزون' : 'Out of stock'}
                              </span>
                            );
                          }
                          if (totalQty <= 5) {
                            return (
                              <div className="space-y-1">
                                <span className="block text-neutral-800">{totalQty} {t.adminProductPiece}</span>
                                <span className="inline-flex items-center gap-1 text-[9px] text-amber-650 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                                  {language === 'ar' ? 'مخزون منخفض' : 'Low stock'}
                                </span>
                              </div>
                            );
                          }
                          return <span className="text-neutral-800">{totalQty} {t.adminProductPiece}</span>;
                        })()}
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditClick(product)}
                            className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 hover:text-black transition-colors cursor-pointer"
                            title={t.adminProductEditTooltip}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteClick(product)}
                            className="p-2 hover:bg-red-50 rounded-xl text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            title={t.adminProductDeleteTooltip}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
