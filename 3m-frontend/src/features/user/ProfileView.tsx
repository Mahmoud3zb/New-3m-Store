import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import type { IOrder } from '../../services/orderService';
import { User, ClipboardList, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

import { ProfileDetailsForm } from './components/ProfileDetailsForm';
import { UserOrdersList } from './components/UserOrdersList';

export function ProfileView() {
  const { isAuthenticated, logout, openAuthModal } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const userOrders = await orderService.getUserOrders();
          const sorted = userOrders.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sorted);
        } catch (error) {
          console.error('Error fetching user orders:', error);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className={`pt-32 pb-20 px-6 max-w-md mx-auto min-h-[75vh] text-center space-y-6 flex flex-col justify-center`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100">
          <User className="w-6 h-6 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-800">{t.loginToViewProfile}</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {t.loginToViewProfileDesc}
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
      
      <div className={`mb-10 border-b border-neutral-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4`}>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif-en uppercase tracking-widest text-neutral-900 mb-2">
            {t.profileTitle}
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            {t.profileSubtitle}
          </p>
        </div>
        <button
          onClick={async () => {
            await logout();
            toast.success(t.logoutSuccess);
          }}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-500 font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {t.logoutBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'profile'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <User className="w-4 h-4" />
            {t.profileTab}
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'orders'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            {t.ordersTab}
            {orders.length > 0 && activeTab !== 'orders' && (
              <span className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-serif-en`}>
                {orders.length}
              </span>
            )}
          </button>
        </div>

        
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileDetailsForm />}

          {activeTab === 'orders' && (
            isLoadingOrders ? (
              <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
                <p className="text-xs text-neutral-400 font-bold">{t.loadingOrders}</p>
              </div>
            ) : (
              <UserOrdersList orders={orders} />
            )
          )}
        </div>

      </div>

    </div>
  );
}
