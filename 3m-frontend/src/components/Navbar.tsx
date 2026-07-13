import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, User, Menu, X, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { translations } from '../lib/translations';
import { productService } from '../services/productService';
import type { IProduct } from '../types';

interface NavbarProps {
  cartCount?: number;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount = 2,
  onLoginClick,
}) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { toggleCartDrawer } = useCartStore();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcementHeight, setAnnouncementHeight] = useState(0);
  const { settings } = useSettingsStore();

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
  const navigate = useNavigate();
  const location = useLocation();

  const isFavoritesActive = location.pathname === '/favorites';
  const isProfileActive = location.pathname === '/profile';
  const isCartActive = location.pathname === '/cart';

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await productService.getProducts({ keyword: searchQuery.trim(), limit: 5 });
        if (response && response.data) {
          setSuggestions(response.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (productId: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `relative text-[13px] font-medium tracking-wide uppercase py-1 text-neutral-600 hover:text-black transition-colors ${
      isActive ? 'text-black font-semibold after:absolute after:bottom-0 after:right-0 after:left-0 after:h-[2px] after:bg-black' : ''
    }`;

  return (
    <>
      <nav 
        className="fixed right-0 left-0 w-full h-20 bg-white/95 backdrop-blur-md border-b border-neutral-100 z-50 px-6 md:px-12 flex justify-between items-center text-neutral-900"
        style={{ 
          top: isVisible ? `${announcementHeight}px` : '-80px',
          transition: 'top 0.3s ease-in-out'
        }}
      >
        
      
        <div className="flex items-center gap-10">
         
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1 hover:opacity-75 transition-opacity cursor-pointer"
            title="القائمة الرئيسية"
          >
            <Menu className="w-5 h-5 text-neutral-800" />
          </button>

          <Link
            to="/"
            className="text-2xl font-sans md:text-3xl font-sans font-black tracking-[0.25em] text-black hover:opacity-85 transition-opacity absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0"
            dir="ltr"
          >
            3M STORE
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={linkClassName}>
              {t.home}
            </NavLink>
            <NavLink to="/shop" className={linkClassName}>
              {t.shop}
            </NavLink>
            <NavLink to="/about" className={linkClassName}>
              {t.aboutUs}
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={linkClassName}>
                {t.dashboard}
              </NavLink>
            )}
          </div>
        </div>

       
        <div className="flex items-center gap-6">
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-neutral-50 hover:bg-neutral-100 focus-within:bg-white border border-neutral-200 focus-within:border-black rounded-full px-3 py-1.5 transition-all duration-300 w-36 md:w-56">
              <Search className={`w-3.5 h-3.5 text-neutral-400 flex-shrink-0 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                className={`text-[11px] bg-transparent border-none outline-none w-full placeholder-neutral-400 text-neutral-800 font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
              />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() && (
              <div 
                className={`absolute top-full mt-2 w-72 md:w-80 bg-white/95 backdrop-blur-md border border-neutral-100 rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-200 ${
                  language === 'ar' ? 'right-0' : 'left-0'
                }`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {isLoadingSuggestions ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
                      <div className="flex-grow space-y-2">
                        <div className="h-3 bg-neutral-200 rounded w-3/4" />
                        <div className="h-2 bg-neutral-200 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
                      <div className="flex-grow space-y-2">
                        <div className="h-3 bg-neutral-200 rounded w-2/3" />
                        <div className="h-2 bg-neutral-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-2 max-h-80 overflow-y-auto">
                    {suggestions.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleSuggestionClick(product._id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                          language === 'ar' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-100 flex-shrink-0">
                          <img 
                            src={product.imageCover || '/p1.jpeg'} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-[11px] font-bold text-neutral-800 truncate">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-serif-en">
                            {product.price} {t.currency}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[11px] text-neutral-400">
                    {t.noSuggestionsFound}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/favorites" 
              className="hidden md:block relative p-1 transition-all duration-300" 
              title="المفضلة"
            >
              <Heart 
                className={`w-[19px] h-[19px] transition-all duration-300 ${
                  isFavoritesActive 
                    ? 'text-black fill-black scale-105' 
                    : 'text-neutral-800 fill-none hover:text-black hover:scale-105'
                }`} 
              />
            </Link>

            <Link 
              to="/profile" 
              className="hidden md:block relative p-1 transition-all duration-300" 
              title="حسابي"
            >
              <User 
                className={`w-[19px] h-[19px] transition-all duration-300 ${
                  isProfileActive 
                    ? 'text-black fill-black scale-105' 
                    : 'text-neutral-800 fill-none hover:text-black hover:scale-105'
                }`} 
              />
            </Link>

            <button 
              onClick={toggleCartDrawer}
              className="relative p-1 transition-all duration-300 cursor-pointer" 
              title="السلة"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`w-[19px] h-[19px] transition-all duration-300 ${
                  isCartActive 
                    ? 'text-black scale-105' 
                    : 'text-neutral-800 hover:text-black hover:scale-105'
                }`}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path 
                  d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1z" 
                  fill={isCartActive ? 'currentColor' : 'none'} 
                />
                <path 
                  d="M4 8h16" 
                  stroke={isCartActive ? '#fff' : 'currentColor'} 
                />
                <path 
                  d="M10 12h4" 
                  stroke={isCartActive ? '#fff' : 'currentColor'} 
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-black text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-serif-en border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <span className="h-4 w-[1px] bg-neutral-200 hidden md:block" />

            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline font-sans text-[11px] font-medium text-neutral-600">{t.welcomeUser}{user?.name?.split(' ')[0]}</span>
                  <button
                    onClick={() => logout()}
                    title={t.logout}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="bg-black text-white hover:bg-black/90 px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {t.login}
                </button>
              )}
            </div>

            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="font-sans bg-neutral-100 hover:bg-neutral-200 text-neutral-800 w-8 h-8 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center uppercase tracking-wider"
              title={language === 'ar' ? 'English' : 'العربية'}
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        </div>
      </nav>

     
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      
      <div 
        className={`fixed inset-y-0 z-50 w-[80%] max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
          language === 'ar' ? 'right-0 text-right' : 'left-0 text-left'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')
        }`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex-grow overflow-y-auto pb-16 pr-1">
        
          <div className="flex justify-between items-center mb-8 border-b border-neutral-100 pb-4">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className=" font-sans font-black tracking-[0.25em] text-xl text-black hover:opacity-85 transition-opacity"
              dir="ltr"
            >
              3M STORE
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 w-8 h-8 rounded-full text-[10px] font-extrabold flex items-center justify-center font-serif-en"
                title={language === 'ar' ? 'English' : 'العربية'}
              >
                {language === 'ar' ? 'EN' : 'AR'}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-50 transition-colors cursor-pointer"
                title={t.closeMenu}
              >
                <X className="w-5 h-5 text-neutral-800" />
              </button>
            </div>
          </div>

         
          {isAuthenticated ? (
            <div className="flex items-center gap-3.5 bg-neutral-50 border border-neutral-100 p-4 rounded-2xl mb-8">
              <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-300/40">
                {user?.profileImage && !user.profileImage.includes('default-avatar') ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-extrabold font-serif-en text-neutral-700 uppercase">
                    {user?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h4 className="text-[12px] font-bold text-neutral-900 truncate">{t.welcomeUser}{user?.name}</h4>
                <p className="text-[10px] text-neutral-400 truncate font-sans">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 bg-neutral-50 border border-neutral-100 p-4 rounded-2xl mb-8">
              <div className="w-12 h-12 bg-neutral-200 rounded-full flex-shrink-0 flex items-center justify-center">
                <User className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[12px] font-bold text-neutral-900">{t.welcomeUser}</h4>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onLoginClick) onLoginClick();
                  }}
                  className="flex items-center gap-1 bg-black text-white hover:bg-neutral-800 text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm animate-pulse"
                >
                  <LogIn className="w-3 h-3" />
                  {t.loginRegister}
                </button>
              </div>
            </div>
          )}

          
          <nav className="flex flex-col gap-5">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[13px] font-bold text-neutral-800 hover:text-black py-1 transition-colors block border-b border-neutral-50 pb-2"
            >
              {t.home}
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[13px] font-bold text-neutral-800 hover:text-black py-1 transition-colors block border-b border-neutral-50 pb-2"
            >
              {t.shop}
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[13px] font-bold text-neutral-800 hover:text-black py-1 transition-colors block border-b border-neutral-50 pb-2"
            >
              {t.aboutUs}
            </Link>
            <Link
              to="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[13px] font-bold text-neutral-800 hover:text-black py-1 transition-colors block border-b border-neutral-50 pb-2"
            >
              {t.favorites}
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[13px] font-bold text-neutral-800 hover:text-black py-1 transition-colors block border-b border-neutral-50 pb-2"
            >
              {t.profile}
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[13px] font-bold text-neutral-800 hover:text-black py-1 transition-colors block border-b border-neutral-50 pb-2"
              >
                {t.dashboard}
              </Link>
            )}
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex justify-between items-center text-[13px] font-bold text-neutral-800 hover:text-black py-1 transition-colors border-b border-neutral-50 pb-2"
            >
              <span>{t.shoppingBag}</span>
              {cartCount > 0 && (
                <span className="bg-black text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center font-serif-en">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

      
        {isAuthenticated && (
          <div className="border-t border-neutral-100 pt-6">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 hover:text-red-500 text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
