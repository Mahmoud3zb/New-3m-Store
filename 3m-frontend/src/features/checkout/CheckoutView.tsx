import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import { ShieldCheck, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';
import { useSettingsStore } from '../../store/settingsStore';

import { ShippingForm } from './components/ShippingForm';
import { OrderSummary } from './components/OrderSummary';

export function CheckoutView() {
  const {
    items,
    clearCart,
    promoCode: appliedPromo,
  } = useCartStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
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

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        openAuthModal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, openAuthModal]);

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
        <form onSubmit={handleSubmit} className="lg:col-span-7">
          <ShippingForm 
            formData={formData}
            handleInputChange={handleInputChange}
            error={error}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isSubmitting={isSubmitting}
          />
        </form>

        <OrderSummary 
          shippingFee={shippingFee}
          hasCitySelected={!!formData.city}
        />
      </div>
    </div>
  );
}
