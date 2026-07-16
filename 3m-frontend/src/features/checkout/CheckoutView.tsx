import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore, getProductPrice } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import { MapPin, Phone, CreditCard, ShieldCheck, ShoppingBag, ArrowLeft, Loader2, Tag, X } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';
import { useSettingsStore } from '../../store/settingsStore';

const CITIES = [
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'القليوبية', en: 'Qalyubia' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'الشرقية', en: 'Sharqia' },
  { ar: 'المنوفية', en: 'Monufia' },
  { ar: 'الغربية', en: 'Gharbia' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'الفيوم', en: 'Fayoum' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'أسيوط', en: 'Asyut' },
  { ar: 'سوهاج', en: 'Sohag' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'أسوان', en: 'Aswan' },
  { ar: 'البحر الأحمر', en: 'Red Sea' }
];

export function CheckoutView() {
  const {
    items,
    totalCartPrice,
    clearCart,
    promoCode: appliedPromo,
    discountAmount,
    applyPromo,
    removePromo
  } = useCartStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const navigate = useNavigate();
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const getShippingFee = () => {
    if (!formData.city) return 0;

    const cairoGiza = ['القاهرة', 'الجيزة', 'Cairo', 'Giza'];
    const deltaAndCanal = [
      'الإسكندرية', 'القليوبية', 'الدقهلية', 'الشرقية', 'المنوفية', 'الغربية', 'دمياط', 'بورسعيد', 'السويس', 'الإسماعيلية',
      'Alexandria', 'Qalyubia', 'Dakahlia', 'Sharqia', 'Monufia', 'Gharbia', 'Damietta', 'Port Said', 'Suez', 'Ismailia'
    ];

    const fees = settings?.shippingFees || { cairoGiza: 100, alexDelta: 80, other: 60 };

    if (cairoGiza.includes(formData.city)) return fees.cairoGiza;
    if (deltaAndCanal.includes(formData.city)) return fees.alexDelta;
    return fees.other;
  };

  const shippingFee = getShippingFee();
  const finalPrice = Math.max(0, totalCartPrice - discountAmount + shippingFee);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        openAuthModal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, openAuthModal]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!formData.phone.trim()) {
      setError(t.phoneRequiredError);
      return;
    }
    if (!formData.city) {
      setError(t.cityRequiredError);
      return;
    }
    if (!formData.street.trim()) {
      setError(t.streetRequiredError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await orderService.createOrder(
        {
          street: formData.street.trim(),
          city: formData.city,
          phone: formData.phone.trim(),
        },
        paymentMethod,
        appliedPromo || undefined
      );

      await clearCart();

      if (paymentMethod === 'card') {
        navigate(`/checkout/payment?orderID=${res.data._id}`);
      } else {
        navigate(`/checkout/success?orderID=${res.data._id}`);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(
        err.response?.data?.message || t.orderProcessingError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className={`pt-32 pb-20 px-6 max-w-xl mx-auto min-h-[70vh] text-center space-y-6`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100">
          <ShoppingBag className="w-6 h-6 text-neutral-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-800">{t.emptyCartCheckoutError}</h2>
          <p className="text-xs text-neutral-400">{t.emptyCartCheckoutDesc}</p>
        </div>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 rounded-xl transition-all shadow-sm"
        >
          {t.browseProductsBtn}
          <ArrowLeft className={`w-3.5 h-3.5 ${language === 'en' ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`pt-32 pb-20 px-6 max-w-xl mx-auto min-h-[70vh] text-center space-y-6`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100">
          <ShieldCheck className="w-6 h-6 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-800">{t.loginRequiredCheckout}</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {t.loginRequiredCheckoutDesc}
          </p>
        </div>
        <button
          onClick={openAuthModal}
          className="bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {t.loginNow}
        </button>
      </div>
    );
  }

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-[85vh] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="mb-10 border-b border-neutral-100 pb-6">
        <h1 className="text-2xl md:text-3xl font-serif-en uppercase tracking-widest text-neutral-900 mb-2">
          {t.checkoutTitle}
        </h1>
        <p className="text-xs text-neutral-400 uppercase tracking-wider">
          {t.checkoutSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
      
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-50 pb-4">
              <MapPin className="w-4 h-4 text-neutral-600" />
              {t.shippingAddressSection}
            </h3>

            {error && (
              <div className="bg-red-50/50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-medium" dir="rtl">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
            
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 block">{t.fullnameLabel}</label>
                <input 
                  type="text" 
                  value={user?.name || ''} 
                  disabled
                  className="w-full bg-neutral-50 border border-neutral-200 text-neutral-550 px-4 py-3 rounded-xl text-xs font-bold outline-none cursor-not-allowed text-left"
                />
              </div>

           
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">{t.phoneLabel}</label>
                <div className="relative">
                  <Phone className={`absolute top-3.5 w-4 h-4 text-neutral-400 ${language === 'ar' ? 'left-4' : 'right-4'}`} />
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.phonePlaceholder}
                    className={`w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-black transition-all px-4 py-3 rounded-xl text-xs font-bold outline-none ${language === 'ar' ? 'pl-10 text-right' : 'pr-10 text-left'}`}
                    required
                  />
                </div>
              </div>

            
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-neutral-700 block">{t.checkoutCityLabel}</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-black transition-all px-4 py-3 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  required
                >
                  <option value="">{t.checkoutCityPlaceholder}</option>
                  {CITIES.map((cityObj) => (
                    <option key={cityObj.ar} value={cityObj.ar}>
                      {language === 'ar' ? cityObj.ar : cityObj.en}
                    </option>
                  ))}
                </select>
              </div>

          
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-neutral-700 block">{t.streetLabel}</label>
                <input 
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder={t.streetPlaceholder}
                  className={`w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-black transition-all px-4 py-3 rounded-xl text-xs font-bold outline-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  required
                />
              </div>

            </div>
          </div>

        
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-50 pb-4">
              <CreditCard className="w-4 h-4 text-neutral-600" />
              {t.paymentMethodSection}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
            
              <div 
                onClick={() => setPaymentMethod('cash')}
                className={`border p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-28 ${
                  paymentMethod === 'cash' 
                    ? 'border-black bg-neutral-50/50 shadow-sm' 
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-neutral-800">{t.paymentCodTitle}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-black bg-black' : 'border-neutral-300'
                  }`}>
                    {paymentMethod === 'cash' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">{t.paymentCodDesc}</p>
              </div>

             
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`border p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-28 ${
                  paymentMethod === 'card' 
                    ? 'border-black bg-neutral-50/50 shadow-sm' 
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-neutral-800">{t.paymentCardTitle}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-black bg-black' : 'border-neutral-300'
                  }`}>
                    {paymentMethod === 'card' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">{t.paymentCardDesc}</p>
              </div>

            </div>
          </div>

          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#111] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                {t.submittingOrder}
              </>
            ) : (
              t.submitOrderBtn
            )}
          </button>

        </form>

        
        <div className="lg:col-span-5 bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 space-y-6 lg:sticky lg:top-28">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4">
            {t.orderItemsSummaryTitle}
          </h3>

        
          <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
            {items.map((item) => {
              const product = item.productID;
              if (!product) return null;

              return (
                <div key={product._id} className="flex gap-4 items-center">
                  <div className="w-12 h-16 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
                    <img 
                      src={product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h4>
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
              {formData.city ? (
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

      </div>

    </div>
  );
}
