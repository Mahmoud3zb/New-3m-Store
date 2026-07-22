import React, { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { useCartStore, getProductPrice } from '../../../store/cartStore';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';
import { api } from '../../../services/api';
import { toast } from 'react-hot-toast';

interface OrderSummaryProps {
  shippingFee: number;
  hasCitySelected: boolean;
}

export function OrderSummary({ shippingFee, hasCitySelected }: OrderSummaryProps) {
  const {
    items,
    totalCartPrice,
    promoCode: appliedPromo,
    discountAmount,
    applyPromo,
    removePromo
  } = useCartStore();
  
  const { language } = useLanguageStore();
  const t = translations[language];

  const [promoCode, setPromoCode] = useState('');
  const [hasActivePromos, setHasActivePromos] = useState(false);

  useEffect(() => {
    const checkActivePromos = async () => {
      try {
        const res = await api.get('/promo/active');
        if (res.data.data && res.data.data.length > 0) {
          setHasActivePromos(true);
        } else {
          setHasActivePromos(false);
        }
      } catch (err) {
        console.error("Failed to fetch active promo codes:", err);
      }
    };
    checkActivePromos();
  }, []);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    try {
      await applyPromo(code);
      toast.success(
        language === 'ar' 
          ? 'تم تطبيق كود الخصم بنجاح!' 
          : 'Promo code applied successfully!'
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || t.promoInvalid);
    }
    setPromoCode('');
  };

  const handleRemovePromo = () => {
    removePromo();
    toast.success(t.promoRemoved);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const finalPrice = Math.max(0, totalCartPrice - discountAmount + shippingFee);

  return (
    <div className="lg:col-span-5 bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 space-y-6 lg:sticky lg:top-28">
      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4">
        {t.orderItemsSummaryTitle}
      </h3>

    
      <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
        {items.map((item) => {
          const product = item.productID;
          if (!product) return null;

          return (
            <div key={`${product._id}-${item.size || ''}-${item.colorCode || ''}`} className="flex gap-4 items-center">
              <div className="w-12 h-16 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
                <img 
                  src={product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h4>
                <p className="text-[9px] text-neutral-500 mt-0.5 flex items-center gap-1.5 font-medium">
                  <span>{language === 'ar' ? `المقاس: ${item.size}` : `Size: ${item.size}`}</span>
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span className="flex items-center gap-1">
                    {language === 'ar' ? 'اللون:' : 'Color:'}
                    <span className="w-2 h-2 rounded-full border border-neutral-300 inline-block" style={{ backgroundColor: item.colorCode }} />
                  </span>
                </p>
                <span className="text-[10px] text-neutral-400 font-serif-en block mt-0.5">
                  {item.quantity} × {formatPrice(getProductPrice(product))}
                </span>
              </div>
              <div className="text-right">
                {product.offer && product.offer.discountedPrice !== undefined && (
                  (() => {
                    const now = new Date();
                    const start = new Date(product.offer.startDate);
                    const end = new Date(product.offer.endDate);
                    if (now >= start && now <= end) {
                      return (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] line-through text-red-500 font-serif-en opacity-70" dir="ltr">
                            {formatPrice(product.price * item.quantity)}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 font-serif-en animate-pulse" dir="ltr">
                            {formatPrice(product.offer.discountedPrice * item.quantity)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()
                ) || (
                  <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                    {formatPrice(product.price * item.quantity)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

     
      {hasActivePromos && (
        <div className="border-t border-neutral-100 pt-4 animate-in fade-in duration-200">
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <div className="relative flex-grow">
              <Tag className={`w-3.5 h-3.5 text-neutral-400 absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t.promoCodePlaceholder}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className={`w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-neutral-200 focus:border-black transition-all rounded-xl text-[11px] font-bold outline-none py-2.5 ${language === 'ar' ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'}`}
              />
            </div>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0"
            >
              {t.promoApplyBtn}
            </button>
          </form>
          
          {appliedPromo && (
            <div className={`flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold mt-2 w-fit ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
              <Tag className="w-3 h-3 text-green-400" />
              <span>{appliedPromo}</span>
              <button 
                type="button" 
                onClick={handleRemovePromo}
                className="p-0.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/75 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      
      <div className="border-t border-neutral-100 pt-4 space-y-3.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">{t.itemsPriceLabel}</span>
          <span className="font-bold font-serif-en" dir="ltr">{formatPrice(totalCartPrice)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-neutral-400">{t.promoDiscountLabel}</span>
            <span className="text-red-500 font-bold font-serif-en" dir="ltr">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-neutral-400">{t.shippingCostLabel}</span>
          {hasCitySelected ? (
            <span className="font-bold font-serif-en" dir="ltr">
              {formatPrice(shippingFee)}
            </span>
          ) : (
            <span className="text-neutral-400 text-[10px] italic">{t.selectCityForShipping}</span>
          )}
        </div>
        
        <div className="border-t border-neutral-100 pt-4 flex justify-between items-center text-sm font-bold">
          <span className="text-neutral-900">{t.totalPriceLabel}</span>
          <span className="text-black font-serif-en text-base" dir="ltr">
            {formatPrice(finalPrice)}
          </span>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-4 text-[10px] text-neutral-400 leading-relaxed text-center">
        {t.secureCheckoutNotice}
      </div>
    </div>
  );
}
