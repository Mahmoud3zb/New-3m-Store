import React, { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import type { IProduct, ICategory, IProductVariant, IProductOffer } from '../../../types';
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
      variants: IProductVariant[];
      categoryID: string;
      offer?: IProductOffer;
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
  const [prodVariants, setProdVariants] = useState<IProductVariant[]>([]);
  const [prodCatId, setProdCatId] = useState('');
  const [prodCoverFile, setProdCoverFile] = useState<File | null>(null);
  const [prodCoverPreview, setProdCoverPreview] = useState<string | null>(null);
  const [prodGalleryFiles, setProdGalleryFiles] = useState<FileList | null>(null);

  // Offer states
  const [hasOffer, setHasOffer] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerEndDate, setOfferEndDate] = useState('');

  const { language } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    if (editingProduct) {
      setProdName(editingProduct.name || '');
      setProdDesc(editingProduct.description || '');
      setProdPrice(editingProduct.price !== undefined && editingProduct.price !== null ? editingProduct.price.toString() : '');
      setProdVariants(editingProduct.variants || []);
      const catId = typeof editingProduct.categoryID === 'object' ? editingProduct.categoryID?._id : editingProduct.categoryID;
      setProdCatId(catId || (categories[0]?._id || ''));
      setProdCoverFile(null);
      setProdCoverPreview(editingProduct.imageCover || null);
      setProdGalleryFiles(null);

      
      if (editingProduct.offer && editingProduct.offer.discountedPrice !== undefined && editingProduct.offer.discountedPrice !== null) {
        setHasOffer(true);
        setDiscountedPrice(editingProduct.offer.discountedPrice.toString());
        const formatLocal = (dStr: string) => {
          if (!dStr) return '';
          const d = new Date(dStr);
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };
        setOfferStartDate(editingProduct.offer.startDate ? formatLocal(editingProduct.offer.startDate) : '');
        setOfferEndDate(editingProduct.offer.endDate ? formatLocal(editingProduct.offer.endDate) : '');
      } else {
        setHasOffer(false);
        setDiscountedPrice('');
        setOfferStartDate('');
        setOfferEndDate('');
      }
    } else {
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdVariants([{ size: 'S', colorCode: '#000000', quantity: 10 }]);
      setProdCatId(categories[0]?._id || '');
      setProdCoverFile(null);
      setProdCoverPreview(null);
      setProdGalleryFiles(null);
      setHasOffer(false);
      setDiscountedPrice('');
      setOfferStartDate('');
      setOfferEndDate('');
    }
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    const offer: IProductOffer | undefined = hasOffer && discountedPrice ? {
      discountedPrice: Number(discountedPrice),
      startDate: offerStartDate ? new Date(offerStartDate + "T00:00:00").toISOString() : new Date().toISOString(),
      endDate: offerEndDate ? new Date(offerEndDate + "T23:59:59").toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    } : undefined;

    onSubmit(e, {
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      variants: prodVariants,
      categoryID: prodCatId,
      offer,
      coverFile: prodCoverFile,
      galleryFiles: prodGalleryFiles,
    });
  };

  const addVariant = () => {
    setProdVariants(prev => [...prev, { size: 'M', colorCode: '#000000', quantity: 10 }]);
  };

  const removeVariant = (index: number) => {
    setProdVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof IProductVariant, value: any) => {
    setProdVariants(prev => prev.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value };
      }
      return v;
    }));
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

          {/* Variants Management */}
          <div className="space-y-3 border-t border-neutral-100 pt-4">
            <div className="flex justify-between items-start flex-col sm:flex-row gap-1">
              <div>
                <label className="text-[10px] font-bold text-neutral-500 block">
                  {language === 'ar' ? 'متغيرات المنتج (المقاس واللون والكمية)' : 'Product Variants (Size, Color, Qty)'}
                </label>
                <p className="text-[9px] text-neutral-400 mt-0.5 leading-normal">
                  {language === 'ar' 
                    ? 'ملاحظة: يتم حساب إجمالي مخزون المنتج تلقائياً بناءً على مجموع كميات المتغيرات المضافة.' 
                    : 'Note: The total product inventory is automatically calculated based on the sum of added variants.'}
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="bg-black text-white hover:bg-neutral-800 text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                {language === 'ar' ? '+ إضافة متغير' : '+ Add Variant'}
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {prodVariants.map((variant, index) => (
                <div key={index} className="flex gap-2 items-center bg-neutral-50 p-2.5 rounded-xl border border-neutral-150">
                  <div className="w-1/4">
                    <input
                      type="text"
                      placeholder="Size (e.g. S, M)"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[11px] font-bold outline-none text-center"
                      required
                    />
                  </div>
                  <div className="w-1/3 flex items-center gap-1.5">
                    <input
                      type="color"
                      value={variant.colorCode}
                      onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                      className="w-8 h-6 bg-white border border-neutral-200 rounded cursor-pointer p-0"
                      required
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      value={variant.colorCode}
                      onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-1.5 py-1 text-[10px] font-mono outline-none text-center"
                      required
                    />
                  </div>
                  <div className="w-1/4">
                    <input
                      type="number"
                      placeholder="Qty"
                      min={0}
                      value={variant.quantity}
                      onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[11px] font-bold outline-none text-center"
                      required
                    />
                  </div>
                  {prodVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
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

          {/* Promotional Offer Setup */}
          <div className="space-y-3 border-t border-neutral-100 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasOffer"
                checked={hasOffer}
                onChange={(e) => setHasOffer(e.target.checked)}
                className="w-4 h-4 border-neutral-300 rounded text-black focus:ring-black cursor-pointer"
              />
              <label htmlFor="hasOffer" className="text-xs font-bold text-neutral-700 cursor-pointer select-none">
                {language === 'ar' ? 'تفعيل عرض ترويجي (خصم مباشر على السعر)' : 'Activate Promotional Offer (Direct Discount)'}
              </label>
            </div>
            <p className="text-[9px] text-neutral-400 leading-normal">
              {language === 'ar' 
                ? 'ملاحظة: تفعيل العرض سيستبدل السعر الأصلي للمنتج بالسعر المخفض تلقائياً في المتجر طوال الفترة المحددة.' 
                : 'Note: Activating the offer will automatically replace the base price with the discounted price in the store during the specified period.'}
            </p>

            {hasOffer && (
              <div className="grid grid-cols-1 gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-150">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 block">
                    {language === 'ar' ? 'السعر المخفض (EGP)' : 'Discounted Price (EGP)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    className={`w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    required={hasOffer}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-500 block">
                      {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                    </label>
                    <input
                      type="date"
                      value={offerStartDate}
                      onChange={(e) => setOfferStartDate(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-500 block">
                      {language === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                    </label>
                    <input
                      type="date"
                      value={offerEndDate}
                      onChange={(e) => setOfferEndDate(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
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
