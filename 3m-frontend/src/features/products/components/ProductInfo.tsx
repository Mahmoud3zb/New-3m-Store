import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Star, ShieldCheck, Ruler, X, Calendar, MessageSquare } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';
import { QuickCheckoutModal } from '../../../components/QuickCheckoutModal';

interface ProductInfoProps {
  product: any;
  reviews: any[];
  averageRate: number;
}

export function ProductInfo({ product, reviews, averageRate }: ProductInfoProps) {
  const { addItem } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [isQuickCheckoutOpen, setIsQuickCheckoutOpen] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        const firstAvailableVariant = product.variants.find((v: any) => v.quantity > 0) || product.variants[0];
        if (firstAvailableVariant) {
          setSelectedSize(firstAvailableVariant.size);
          setSelectedColor(firstAvailableVariant.colorCode);
        }
      }
    }
  }, [product]);

  const categoryName = typeof product.categoryID === 'object' && product.categoryID
    ? (product.categoryID as any).name
    : (language === 'ar' ? 'مجموعة غير محددة' : 'General Collection');

  const isWishlisted = product ? wishlistItems.some((item) => item._id === product._id) : false;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, 1, selectedSize, selectedColor);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsQuickCheckoutOpen(true);
  };

  return (
    <div className="lg:col-span-6 space-y-8">
     
      <div className="space-y-4">
        <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">
          {categoryName}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
          {product.name}
        </h1>
        
        <div className={`flex items-center gap-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-neutral-500">({reviews.length} {t.reviewsCount})</span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold text-neutral-900 mt-0.5">{averageRate || '0.0'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-2xl font-serif-en font-black text-neutral-950 pt-2 flex items-center gap-2" dir="ltr">
            {product.offer && product.offer.discountedPrice !== undefined && (
              (() => {
                const now = new Date();
                const start = new Date(product.offer.startDate);
                const end = new Date(product.offer.endDate);
                if (now >= start && now <= end) {
                  return (
                    <>
                      <span className="text-sm line-through text-red-500 font-serif-en opacity-70">
                        {product.price} {t.currency}
                      </span>
                      <span>
                        {product.offer.discountedPrice} {t.currency}
                      </span>
                    </>
                  );
                }
                return null;
              })()
            ) || (
              <span>
                {product.price} {t.currency}
              </span>
            )}
          </div>
          
          {(() => {
            const totalQuantity = product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0;
            if (totalQuantity === 0) {
              return (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-650 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-wider animate-pulse mt-2">
                  {t.outOfStock}
                </span>
              );
            } else if (totalQuantity <= 5) {
              return (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-650 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-wider mt-2">
                  {t.onlyItemsLeft.replace('{count}', String(totalQuantity))}
                </span>
              );
            }
            return null;
          })()}
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
          {product.description}
        </p>
      </div>

     
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-neutral-800">{t.selectSize}</span>
          <button
            onClick={() => setShowSizeGuide(true)}
            className="text-[11px] font-bold text-neutral-500 hover:text-black underline cursor-pointer flex items-center gap-1 transition-colors"
          >
            <Ruler className="w-3.5 h-3.5" />
            {t.sizeGuide}
          </button>
        </div>
        <div className={`flex gap-2.5 font-serif-en text-xs ${language === 'ar' ? 'justify-end' : 'justify-start'}`} dir="ltr">
          {(Array.from(new Set((product.variants as any[])?.map((v) => v.size) || []))).map((size) => {
            const isActive = selectedSize === size;
            const totalQuantity = product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0;
            return (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  const firstColorForSize = product.variants.find((v: any) => v.size === size && v.quantity > 0)?.colorCode 
                    || product.variants.find((v: any) => v.size === size)?.colorCode;
                  if (firstColorForSize) {
                    setSelectedColor(firstColorForSize);
                  }
                }}
                disabled={totalQuantity === 0}
                className={`w-11 h-11 border flex justify-center items-center rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                    : 'border-neutral-200 text-neutral-800 hover:border-black'
                } ${totalQuantity === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      
      <div className="space-y-3">
        <span className="text-xs font-bold text-neutral-800 block">
          {language === 'ar' ? 'اختر اللون' : 'Select Color'}
        </span>
        <div className={`flex gap-3 items-center flex-wrap ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
          {(product.variants || [])
            .filter((v: any) => v.size === selectedSize)
            .map((v: any) => {
              const isActive = selectedColor === v.colorCode;
              const isOutOfStock = v.quantity === 0;
              return (
                <button
                  key={v.colorCode}
                  onClick={() => !isOutOfStock && setSelectedColor(v.colorCode)}
                  disabled={isOutOfStock}
                  style={{ backgroundColor: v.colorCode }}
                  className={`w-8 h-8 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                    isActive 
                      ? 'ring-2 ring-neutral-950 ring-offset-2 scale-110 shadow-sm' 
                      : 'border-neutral-200 hover:scale-105'
                  } ${isOutOfStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                  title={v.colorCode}
                >
                  {isActive && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ 
                        backgroundColor: ['#ffffff', '#fff'].includes(v.colorCode.toLowerCase()) ? '#000000' : '#ffffff' 
                      }} 
                    />
                  )}
                </button>
              );
            })}
        </div>
        {(() => {
          const selectedVariant = (product.variants as any[])?.find((v) => v.size === selectedSize && v.colorCode === selectedColor);
          if (selectedVariant) {
            if (selectedVariant.quantity === 0) {
              return (
                <span className="text-[11px] text-red-500 font-bold block mt-2">
                  {language === 'ar' ? '⚠️ نفدت الكمية لهذا اللون والمقاس!' : '⚠️ Out of stock for this size & color!'}
                </span>
              );
            } else {
              return (
                <span className="text-[11px] text-neutral-400 font-bold block mt-2">
                  {language === 'ar' 
                    ? `📦 الكمية المتوفرة: ${selectedVariant.quantity} قطعة` 
                    : `📦 Available stock: ${selectedVariant.quantity} items`}
                </span>
              );
            }
          }
          return null;
        })()}
      </div>

      
      <div className="space-y-4 border-t border-neutral-100 pt-8">
        <button
          onClick={handleBuyNow}
          disabled={(product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0) === 0}
          className={`w-full text-xs font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            (product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0) === 0
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-100'
              : 'bg-black hover:bg-black text-white'
          }`}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          {(product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0) === 0 ? t.outOfStock : (language === 'ar' ? 'شراء الآن (الدفع عند الاستلام)' : 'Buy Now (Cash on Delivery)')}
        </button>

        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            disabled={(product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0) === 0}
            className={`flex-1 text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              (product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0) === 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-100'
                : 'bg-neutral-950 hover:bg-black text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {(product.variants?.reduce((sum: number, v: any) => sum + v.quantity, 0) ?? 0) === 0 ? t.outOfStock : t.addToShoppingBag}
          </button>
          
          <button
            onClick={() => toggleWishlist(product)}
            className={`w-14 h-14 border flex justify-center items-center transition-all cursor-pointer rounded-xl ${
              isWishlisted
                ? 'border-red-500 bg-red-50 text-red-500'
                : 'border-neutral-200 text-neutral-600 hover:border-black'
            }`}
            title={isWishlisted ? t.removeFromWishlist : t.addToWishlist}
          >
            <Heart
              className="w-5 h-5"
              fill={isWishlisted ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>

      
      <div className="bg-neutral-50/60 border border-neutral-100/80 rounded-2xl p-4 flex justify-between text-[11px] text-neutral-500 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t.original100}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>{t.return14Days}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-neutral-400" />
          <span>{t.supportAlways}</span>
        </div>
      </div>

     
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowSizeGuide(false)} />
          <div 
            className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <button 
              onClick={() => setShowSizeGuide(false)} 
              className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-400 hover:text-neutral-700`}
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Ruler className="w-5 h-5 text-neutral-800" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">{t.sizeGuideTitle}</h3>
            </div>

            <div className="overflow-hidden border border-neutral-100 rounded-2xl mb-4">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-100">
                    <th className="py-2.5 px-3">{language === 'ar' ? 'المقاس' : 'Size'}</th>
                    <th className="py-2.5 px-3">{t.sizeGuideChest}</th>
                    <th className="py-2.5 px-3">{t.sizeGuideLength}</th>
                    <th className="py-2.5 px-3">{t.sizeGuideShoulders}</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {[
                    { name: 'XS', chest: '46', length: '66', shoulders: '40' },
                    { name: 'S', chest: '48', length: '68', shoulders: '42' },
                    { name: 'M', chest: '50', length: '70', shoulders: '44' },
                    { name: 'L', chest: '52', length: '72', shoulders: '46' },
                    { name: 'XL', chest: '54', length: '74', shoulders: '48' }
                  ].map((row) => {
                    const isSelected = selectedSize === row.name;
                    return (
                      <tr 
                        key={row.name}
                        className={`transition-colors duration-200 border-b border-neutral-100/70 last:border-b-0 ${
                          isSelected 
                            ? 'bg-neutral-950 text-white font-bold' 
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold">{row.name}</td>
                        <td className="py-3 px-3 font-mono">{row.chest}</td>
                        <td className="py-3 px-3 font-mono">{row.length}</td>
                        <td className="py-3 px-3 font-mono">{row.shoulders}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
              {t.sizeGuideNote}
            </p>
          </div>
        </div>
      )}

      
      <QuickCheckoutModal
        isOpen={isQuickCheckoutOpen}
        onClose={() => setIsQuickCheckoutOpen(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />
    </div>
  );
}
