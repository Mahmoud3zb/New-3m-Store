import React, { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import type { IProduct, ICategory } from '../../../types';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    e: React.FormEvent,
    data: {
      name: string;
      description: string;
      price: string;
      quantity: string;
      categoryID: string;
      coverFile: File | null;
      galleryFiles: FileList | null;
    }
  ) => void;
  isSubmitting: boolean;
  editingProduct: IProduct | null;
  categories: ICategory[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingProduct,
  categories,
}) => {
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodQty, setProdQty] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodCoverFile, setProdCoverFile] = useState<File | null>(null);
  const [prodCoverPreview, setProdCoverPreview] = useState<string | null>(null);
  const [prodGalleryFiles, setProdGalleryFiles] = useState<FileList | null>(null);
  const { language } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    if (editingProduct) {
      setProdName(editingProduct.name);
      setProdDesc(editingProduct.description || '');
      setProdPrice(editingProduct.price.toString());
      setProdQty(editingProduct.quantity.toString());
      const catId = typeof editingProduct.categoryID === 'object' ? editingProduct.categoryID?._id : editingProduct.categoryID;
      setProdCatId(catId || (categories[0]?._id || ''));
      setProdCoverFile(null);
      setProdCoverPreview(editingProduct.imageCover || null);
      setProdGalleryFiles(null);
    } else {
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdQty('');
      setProdCatId(categories[0]?._id || '');
      setProdCoverFile(null);
      setProdCoverPreview(null);
      setProdGalleryFiles(null);
    }
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, {
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      quantity: prodQty,
      categoryID: prodCatId,
      coverFile: prodCoverFile,
      galleryFiles: prodGalleryFiles,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h3 className="text-sm font-bold text-neutral-800">
            {editingProduct ? t.adminModalEditProduct : t.adminModalAddProduct}
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 space-y-4 overflow-y-auto flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelProductName}</label>
            <input 
              type="text" 
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 ${language === 'ar' ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelProductDesc}</label>
            <textarea 
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              rows={3}
              className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 resize-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelProductPrice}</label>
              <input 
                type="number" 
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                min={1}
                className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelProductQty}</label>
              <input 
                type="number" 
                value={prodQty}
                onChange={(e) => setProdQty(e.target.value)}
                min={0}
                className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelProductCat}</label>
            <select 
              value={prodCatId}
              onChange={(e) => setProdCatId(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 cursor-pointer"
              required
            >
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelProductCover}</label>
            <div className="flex items-center gap-4">
              <label className="border-2 border-dashed border-neutral-200 hover:border-black rounded-2xl px-4 py-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-neutral-50/30 flex-1">
                <ImageIcon className="w-5 h-5 text-neutral-400" />
                <span className="text-[9px] text-neutral-400 font-bold">{t.adminModalLabelProductCoverClick}</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProdCoverFile(file);
                      setProdCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>
              {prodCoverPreview && (
                <div className="w-16 h-20 bg-neutral-50 border border-neutral-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm relative group">
                  <img src={prodCoverPreview} className="w-full h-full object-cover" alt="cover preview" />
                  <button 
                    type="button"
                    onClick={() => {
                      setProdCoverFile(null);
                      setProdCoverPreview(null);
                    }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {!editingProduct && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 block">{t.adminModalLabelProductGallery}</label>
              <label className="border-2 border-dashed border-neutral-200 hover:border-black rounded-2xl px-4 py-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-neutral-50/30">
                <span className="text-[9px] text-neutral-400 font-bold">
                  {prodGalleryFiles && prodGalleryFiles.length > 0 
                    ? (language === 'ar' ? `تم اختيار ${prodGalleryFiles.length} صورة` : `Selected ${prodGalleryFiles.length} images`) 
                    : t.adminModalLabelProductGalleryClick
                  }
                </span>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={(e) => setProdGalleryFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
          )}

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
              className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t.adminModalSaveProduct}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
