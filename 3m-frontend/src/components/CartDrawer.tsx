import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../lib/translations';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

export function CartDrawer() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language];

  const {
    items,
    totalCartPrice,
    isCartOpen,
    closeCartDrawer,
    removeItem,
    updateItemQuantity,
    promoCode,
    discountAmount,
    applyPromo,
    removePromo
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
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
        console.error('Failed to fetch active promo codes:', err);
      }
    };
    if (isCartOpen) {
      checkActivePromos();
    }
  }, [isCartOpen]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    setIsApplying(true);
    try {
      await applyPromo(code);
      toast.success(
        language === 'ar' 
          ? 'تم تطبيق كود الخصم بنجاح!' 
          : 'Promo code applied successfully!'
      );
      setPromoInput('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || t.promoInvalid);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCheckoutClick = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isCartOpen) return null;

  const isRTL = language === 'ar';
  const finalPrice = Math.max(0, totalCartPrice - discountAmount);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" dir={isRTL ? 'rtl' : 'ltr'}>
      
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={closeCartDrawer}
      />

      
      <div 
        className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 animate-in ${
          isRTL 
            ? 'slide-in-from-left left-0' 
            : 'slide-in-from-right right-0'
        }`}
      >
        
       
        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-neutral-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              {language === 'ar' ? 'حقيبة التسوق' : 'Shopping Bag'}
            </h2>
            <span className="bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-serif-en">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={closeCartDrawer}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer text-neutral-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 border border-neutral-100">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  {language === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
                </h3>
                <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px] mx-auto">
                  {language === 'ar' 
                    ? 'ابدأ بإضافة بعض المنتجات الرائعة إلى سلة المشتريات الخاصة بك.' 
                    : 'Add some amazing products to your cart to get started.'}
                </p>
              </div>
              <button
                onClick={() => {
                  closeCartDrawer();
                  navigate('/shop');
                }}
                className="bg-black hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer"
              >
                {language === 'ar' ? 'تصفح المعرض' : 'Browse Gallery'}
              </button>
            </div>
          ) : (
            items.map((item) => {
              const product = item.productID;
              if (!product) return null;
              return (
                <div 
                  key={product._id} 
                  className="flex gap-4 p-3 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl transition-all"
                >
                  
                  <div className="w-20 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100/50">
                    <img 
                      src={product.imageCover || '/p1.jpeg'} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-[10px] font-serif-en text-neutral-400 mt-0.5">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      
                      <div className="flex items-center border border-neutral-200 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(product._id, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-50 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-[11px] font-bold text-neutral-800 font-serif-en">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(product._id, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-50 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      
                      <button
                        onClick={() => removeItem(product._id)}
                        className="text-neutral-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title={language === 'ar' ? 'حذف من السلة' : 'Remove from cart'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        
        {items.length > 0 && (
          <div className="border-t border-neutral-100 p-6 bg-white space-y-4">
            
            
            {hasActivePromos && (
              <div className="border-b border-neutral-50 pb-4">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag className={`w-3.5 h-3.5 text-neutral-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      placeholder={t.promoCodePlaceholder}
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      disabled={isApplying}
                      className={`w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-neutral-200 focus:border-black transition-all rounded-xl text-[11px] font-bold outline-none py-2.5 ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0"
                  >
                    {t.promoApplyBtn}
                  </button>
                </form>

                
                {promoCode && (
                  <div className={`flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold mt-2 w-fit ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                    <Tag className="w-3 h-3 text-green-400" />
                    <span>{promoCode}</span>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="p-0.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/75 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-500">
                <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-bold font-serif-en">{formatPrice(totalCartPrice)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-red-500">
                  <span>{t.promoDiscountLabel}</span>
                  <span className="font-bold font-serif-en">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                <span>{language === 'ar' ? 'المجموع الكلي' : 'Grand Total'}</span>
                <span className="font-serif-en text-base">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              {language === 'ar' ? 'الذهاب للدفع' : 'Proceed to Checkout'}
              {isRTL ? (
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
