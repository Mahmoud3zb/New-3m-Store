import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Tag, ShoppingBag, Truck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../lib/translations';
import { orderService } from '../services/orderService';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { useSettingsStore } from '../store/settingsStore';
import type { IProduct } from '../types';

interface QuickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct;
  selectedSize: string;
  selectedColor: string;
}

export function QuickCheckoutModal({ isOpen, onClose, product, selectedSize, selectedColor }: QuickCheckoutModalProps) {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language];
  const { isAuthenticated, openAuthModal } = useAuthStore();
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

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const [isApplying, setIsApplying] = useState(false);
  const [hasActivePromos, setHasActivePromos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if product has an active offer
  const hasActiveOffer = !!(product.offer && 
    product.offer.discountedPrice !== undefined && 
    new Date() < new Date(product.offer.endDate));

  const basePrice = (hasActiveOffer && product.offer && product.offer.discountedPrice !== undefined) 
    ? product.offer.discountedPrice 
    : product.price;

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
    if (isOpen) {
      checkActivePromos();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    setIsApplying(true);
    try {
      const res = await api.post('/promo/validate', { code });
      const { discountType, discountValue } = res.data.data;
      
      setAppliedPromo(code);

      let discount = 0;
      if (discountType === 'percentage') {
        discount = Math.round(basePrice * (discountValue / 100));
      } else {
        discount = Math.min(basePrice, discountValue);
      }
      setDiscountAmount(discount);
      
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

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!formData.phone.trim()) {
      setError(language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required');
      return;
    }
    if (!formData.city) {
      setError(language === 'ar' ? 'يرجى اختيار المحافظة' : 'Please select your city');
      return;
    }
    if (!formData.street.trim()) {
      setError(language === 'ar' ? 'العنوان بالتفصيل مطلوب' : 'Detailed address is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const shippingAddress = {
        street: formData.street.trim(),
        city: formData.city,
        phone: formData.phone.trim(),
      };

      const res = await orderService.createDirectOrder(
        product._id,
        1, 
        selectedSize,
        selectedColor,
        shippingAddress,
        appliedPromo || undefined
      );

      toast.success(
        language === 'ar'
          ? 'تم تسجيل طلبك بنجاح! شكرًا لك.'
          : 'Your order was successfully placed! Thank you.'
      );
      
      onClose();
      navigate(`/checkout/success?orderID=${res.data._id}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        (language === 'ar' ? 'عذرًا، حدث خطأ أثناء إتمام الطلب.' : 'Sorry, an error occurred while processing your order.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  const isRTL = language === 'ar';
  const shippingFee = getShippingFee();
  const grandTotal = Math.max(0, basePrice - discountAmount + shippingFee);

  const citiesList = [
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
    { ar: 'البحيرة', en: 'Beheira' },
    { ar: 'الفيوم', en: 'Fayoum' },
    { ar: 'بني سويف', en: 'Beni Suef' },
    { ar: 'المنيا', en: 'Minya' },
    { ar: 'أسيوط', en: 'Asyut' },
    { ar: 'سوهاج', en: 'Sohag' },
    { ar: 'قنا', en: 'Qena' },
    { ar: 'الأقصر', en: 'Luxor' },
    { ar: 'أسوان', en: 'Aswan' },
    { ar: 'البحر الأحمر', en: 'Red Sea' },
    { ar: 'الوادى الجديد', en: 'New Valley' },
    { ar: 'مطروح', en: 'Matrouh' },
    { ar: 'شمال سيناء', en: 'North Sinai' },
    { ar: 'جنوب سيناء', en: 'South Sinai' },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

     
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-y-auto md:overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        
        <button 
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 hover:bg-neutral-100 rounded-full transition-colors z-20 cursor-pointer text-neutral-500 hover:text-black`}
        >
          <X className="w-5 h-5" />
        </button>

        
        <div className="w-full md:w-5/12 bg-neutral-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-100">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              {isRTL ? 'المنتج المختار' : 'Selected Item'}
            </h3>
            
            <div className="aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200/50 shadow-sm">
              <img 
                src={product.imageCover || '/p1.jpeg'} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 truncate">
                {product.name}
              </h4>
              <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{isRTL ? `المقاس: ${selectedSize}` : `Size: ${selectedSize}`}</span>
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <span className="flex items-center gap-1">
                  {isRTL ? 'اللون:' : 'Color:'}
                  <span className="w-3 h-3 rounded-full border border-neutral-300 inline-block" style={{ backgroundColor: selectedColor }} />
                </span>
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <span>{isRTL ? 'الكمية: ١' : 'Qty: 1'}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-200/60 pt-4 mt-6 space-y-2">
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>{isRTL ? 'السعر' : 'Price'}</span>
              <span className="font-bold font-serif-en">{formatPrice(basePrice)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-[11px] text-red-500">
                <span>{t.promoDiscountLabel}</span>
                <span className="font-bold font-serif-en">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>{isRTL ? 'مصاريف الشحن' : 'Shipping'}</span>
              <span className="font-bold font-serif-en">
                {formData.city ? formatPrice(shippingFee) : (isRTL ? 'حدد المحافظة' : 'Select city')}
              </span>
            </div>

            <div className="flex justify-between text-xs font-bold text-neutral-900 pt-2 border-t border-neutral-150">
              <span>{isRTL ? 'الإجمالي الكلي' : 'Total Price'}</span>
              <span className="font-serif-en">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between md:overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="w-4 h-4 text-neutral-850" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                {isRTL ? 'شراء سريع بالدفع عند الاستلام' : 'COD Quick Purchase'}
              </h2>
            </div>

            {!isAuthenticated ? (
              <div className="py-12 text-center space-y-4">
                <p className="text-xs text-neutral-500">
                  {isRTL 
                    ? 'يرجى تسجيل الدخول أولاً لتتمكن من إتمام الشراء السريع بضغطة واحدة.'
                    : 'Please log in to complete your quick one-click purchase.'}
                </p>
                <button
                  onClick={() => openAuthModal()}
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Log In'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block">
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01xxxxxxxxx"
                    className={`w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-black transition-all rounded-xl text-xs py-2.5 px-3 font-medium outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                </div>

                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block">
                    {isRTL ? 'المحافظة / المدينة' : 'City / Governorate'}
                  </label>
                  <select
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-black transition-all rounded-xl text-xs py-2.5 px-3 font-medium outline-none appearance-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <option value="">{isRTL ? '-- اختر المحافظة --' : '-- Select City --'}</option>
                    {citiesList.map((city, idx) => (
                      <option key={idx} value={isRTL ? city.ar : city.en}>
                        {isRTL ? city.ar : city.en}
                      </option>
                    ))}
                  </select>
                </div>

                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block">
                    {isRTL ? 'العنوان بالتفصيل (الشارع / رقم المبنى / الشقة)' : 'Detailed Address (Street / Building / Flat)'}
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder={isRTL ? 'مثال: شارع المعز، مبنى ٥، شقة ٣' : 'e.g. Al-Moez St, Building 5, Flat 3'}
                    className={`w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-black transition-all rounded-xl text-xs py-2.5 px-3 font-medium outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                </div>

                
                {hasActivePromos && (
                  <div className="pt-2 border-t border-neutral-100">
                    <label className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                      {isRTL ? 'كود الخصم (اختياري)' : 'Promo Code (Optional)'}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Tag className={`w-3.5 h-3.5 text-neutral-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
                        <input
                          type="text"
                          placeholder={t.promoCodePlaceholder}
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          disabled={isApplying}
                          className={`w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-neutral-200 focus:border-black transition-all rounded-xl text-[11px] font-bold outline-none py-2 px-8 ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isApplying}
                        className="bg-black hover:bg-neutral-800 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0"
                      >
                        {t.promoApplyBtn}
                      </button>
                    </div>

                    {appliedPromo && (
                      <div className={`flex items-center gap-1.5 bg-neutral-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold mt-2 w-fit ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                        <Tag className="w-3 h-3 text-green-400" />
                        <span>{appliedPromo}</span>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="p-0.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/75 hover:text-white"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <p className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-150 p-2.5 rounded-xl">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>

          {isAuthenticated && (
            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 justify-center text-[10px] text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{isRTL ? 'الدفع عند الاستلام مباشر وموثق ١٠٠٪' : '100% Secure COD Direct Checkout'}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                {isSubmitting ? (isRTL ? 'جاري تسجيل طلبك...' : 'Processing...') : (isRTL ? 'تأكيد طلب الشراء السريع' : 'Confirm Express COD Order')}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
