import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';
import { api } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { Trash2, Plus, Tag, Loader2 } from 'lucide-react';

interface IPromo {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  createdAt: string;
}

export function PromosTab() {
  const { language } = useLanguageStore();
  const t = translations[language];

  const [promos, setPromos] = useState<IPromo[]>([]);
  const [loading, setLoading] = useState(false);
  
  
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: IPromo[] }>('/promo');
      setPromos(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error(language === 'ar' ? 'فشل تحميل أكواد الخصم' : 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error(t.adminPromoCodeRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/promo', {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        isActive
      });
      toast.success(t.adminPromoSaveSuccess);
      setCode('');
      setDiscountValue('');
      setIsActive(true);
      fetchPromos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء حفظ الكود' : 'Failed to save promo code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.adminPromoDeleteConfirm)) return;

    try {
      await api.delete(`/promo/${id}`);
      toast.success(language === 'ar' ? 'تم حذف كود الخصم بنجاح' : 'Promo code deleted successfully');
      fetchPromos();
    } catch (err) {
      console.error(err);
      toast.error(language === 'ar' ? 'فشل حذف كود الخصم' : 'Failed to delete promo code');
    }
  };

  return (
    <div className="space-y-8">
      
      
      <div>
        <h2 className="text-xl font-serif-en uppercase tracking-wider text-neutral-900 mb-1">
          {t.adminPromoTitle}
        </h2>
        <p className="text-xs text-neutral-400">
          {t.adminPromoSubtitle}
        </p>
      </div>

      
      <form onSubmit={handleSubmit} className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2 border-b border-neutral-50 pb-3">
          <Plus className="w-4 h-4 text-neutral-500" />
          {t.adminPromoAddBtn}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block uppercase tracking-wider">
              {t.adminPromoCodeLabel}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., AZB50"
              className={`w-full bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white px-3 py-2 text-xs font-bold rounded-xl outline-none transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block uppercase tracking-wider">
              {t.adminPromoTypeLabel}
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              className={`w-full bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white px-3 py-2 text-xs font-bold rounded-xl outline-none transition-all appearance-none cursor-pointer ${language === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <option value="percentage">{t.adminPromoPercentage}</option>
              <option value="fixed">{t.adminPromoFixed}</option>
            </select>
          </div>

         
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 block uppercase tracking-wider">
              {t.adminPromoValueLabel}
            </label>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percentage' ? '15 (%)' : '100 (EGP)'}
              className={`w-full bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white px-3 py-2 text-xs font-bold rounded-xl outline-none transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          
          <div className="flex items-center gap-2 h-10 px-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 border-neutral-300 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-neutral-700 cursor-pointer select-none">
              {t.adminPromoActive}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Tag className="w-3.5 h-3.5" />
              {language === 'ar' ? 'حفظ الكود' : 'Save Code'}
            </>
          )}
        </button>
      </form>

    
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            <p className="text-xs text-neutral-400">{t.adminPromoLoadingList}</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-10 text-xs text-neutral-400">
            {t.adminPromoNoPromos}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="text-neutral-400 border-b border-neutral-50 pb-4">
                  <th className="pb-3 text-start font-bold uppercase tracking-wider">{t.adminPromoCodeLabel}</th>
                  <th className="pb-3 text-start font-bold uppercase tracking-wider">{t.adminPromoTypeLabel}</th>
                  <th className="pb-3 text-start font-bold uppercase tracking-wider">{t.adminPromoValueLabel}</th>
                  <th className="pb-3 text-start font-bold uppercase tracking-wider">{t.adminPromoStatusLabel}</th>
                  <th className="pb-3 text-end font-bold uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 text-start font-extrabold text-neutral-900 tracking-wider">
                      <span className="bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-lg text-[10px] font-mono">
                        {promo.code}
                      </span>
                    </td>
                    <td className="py-4 text-start text-neutral-500 font-medium">
                      {promo.discountType === 'percentage' ? t.adminPromoPercentage : t.adminPromoFixed}
                    </td>
                    <td className="py-4 text-start font-extrabold font-serif-en">
                      {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue} EGP`}
                    </td>
                    <td className="py-4 text-start">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        promo.isActive 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-neutral-50 text-neutral-600 border border-neutral-100'
                      }`}>
                        {promo.isActive ? t.adminPromoActive : t.adminPromoInactive}
                      </span>
                    </td>
                    <td className="py-4 text-end">
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 text-neutral-400 rounded-xl transition-all cursor-pointer"
                        title={language === 'ar' ? 'حذف كود الخصم' : 'Delete promo code'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
