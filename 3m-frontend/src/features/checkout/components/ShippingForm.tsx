import React from 'react';
import { MapPin, Phone, CreditCard, Loader2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';
import { useAuthStore } from '../../../store/authStore';

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

interface ShippingFormProps {
  formData: {
    street: string;
    city: string;
    phone: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error: string;
  paymentMethod: 'cash' | 'card';
  setPaymentMethod: (method: 'cash' | 'card') => void;
  isSubmitting: boolean;
}

export function ShippingForm({
  formData,
  handleInputChange,
  error,
  paymentMethod,
  setPaymentMethod,
  isSubmitting,
}: ShippingFormProps) {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="space-y-8">
      
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
    </div>
  );
}
