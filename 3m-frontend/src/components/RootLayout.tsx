import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import type { TabType } from './MobileNav';
import { AuthModal } from '../features/auth/AuthModal';
import { Toaster } from 'react-hot-toast';
import { CartDrawer } from './CartDrawer';
import { AnnouncementBar } from './AnnouncementBar';

import { useEffect, useState } from 'react';
import { MobileSearchOverlay } from './MobileSearchOverlay';
import { WhatsAppWidget } from './WhatsAppWidget';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useLanguageStore } from '../store/languageStore';
import { useSettingsStore } from '../store/settingsStore';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const { items, fetchCart } = useCartStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  
  const { isAuthModalOpen, openAuthModal, closeAuthModal, isAuthenticated, user } = useAuthStore();
  const { language } = useLanguageStore();
  
  const { settings, fetchSettings } = useSettingsStore();
  const [announcementHeight, setAnnouncementHeight] = useState(0);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const updateHeight = () => {
      const showAnnouncement = settings?.announcement?.show;
      const isDismissed = localStorage.getItem('3m_announcement_dismissed') === 'true';
      setAnnouncementHeight(showAnnouncement && !isDismissed ? 36 : 0);
    };

    updateHeight();
    window.addEventListener('announcement:toggle', updateHeight);
    return () => window.removeEventListener('announcement:toggle', updateHeight);
  }, [settings]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist, isAuthenticated]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const getActiveTab = (): TabType => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/shop')) return 'shop';
    if (path === '/favorites') return 'favorites';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: TabType) => {
    if (tab === 'search') {
      setIsMobileSearchOpen(true);
      return;
    }
    if (tab === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'shop') {
      navigate('/shop');
    } else if (tab === 'favorites') {
      navigate('/favorites');
    } else if (tab === 'profile') {
      navigate('/profile');
    }
  };

  
  if (settings?.maintenanceMode && user?.role !== 'admin') {
    return (
      <div 
        className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none" 
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="max-w-md w-full space-y-8 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-8 shadow-2xl animate-in fade-in duration-700">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-xl font-black uppercase tracking-wider font-serif-en">
              {language === 'ar' ? 'الموقع تحت الصيانة المؤقتة' : 'Store Under Maintenance'}
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {language === 'ar' 
                ? 'نقوم حالياً ببعض أعمال الصيانة لنمنحكم تجربة تسوق أرقى وأسرع. سنعود للعمل قريباً جداً، شكراً لتفهمكم!' 
                : 'We are performing routine maintenance to improve our systems. We will be back online shortly, thank you for your patience!'}
            </p>
          </div>

          <div className="border-t border-neutral-800 pt-6 space-y-4">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">
              {language === 'ar' ? 'قنوات التواصل' : 'Contact Support'}
            </span>
            <div className="text-xs text-neutral-400 space-y-2">
              {settings.contactInfo.phone && (
                <p>
                  {language === 'ar' ? 'الهاتف: ' : 'Phone: '} 
                  <span className="font-serif-en font-bold text-white">{settings.contactInfo.phone}</span>
                </p>
              )}
              {settings.contactInfo.email && (
                <p>
                  {language === 'ar' ? 'البريد: ' : 'Email: '} 
                  <span className="font-serif-en text-white">{settings.contactInfo.email}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F8F8F8] text-[#111] overflow-x-hidden relative flex flex-col w-full transition-all duration-300"
      style={{ paddingTop: `${announcementHeight}px` }}
    >
      <AnnouncementBar />
      
      <Navbar
        cartCount={cartCount}
        onLoginClick={openAuthModal}
      />

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <Footer />

      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoritesCount={wishlistCount}
      />

      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />

      <WhatsAppWidget />

      <CartDrawer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 'bold',
            borderRadius: '16px',
            background: '#fff',
            color: '#111',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
            padding: '12px 20px',
          }
        }}
      />
    </div>
  );
}
export default RootLayout;
