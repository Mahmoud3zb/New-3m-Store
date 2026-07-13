import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

export function FavoritesView() {
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const { addItem } = useCartStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: any) => {
    addItem(product);
  };

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-[80vh] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
     
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-serif-en uppercase tracking-widest mb-3 text-neutral-900">
          {t.wishlistTitle}
        </h1>
        <p className="text-xs md:text-sm text-neutral-400 uppercase tracking-widest font-sans font-medium">
          {t.wishlistSubtitle}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-white p-3 rounded-3xl border border-neutral-100/40 space-y-4">
              <div className="aspect-[3/4] bg-neutral-200 rounded-2xl w-full" />
              <div className="h-4 bg-neutral-200 rounded w-1/3" />
              <div className="h-5 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-10 bg-neutral-200 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 bg-white border border-neutral-100 p-8 rounded-3xl shadow-sm space-y-5">
          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100">
            <Heart className="w-8 h-8 text-neutral-300" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-neutral-800">{t.wishlistEmptyTitle}</h3>
            <p className="text-xs text-neutral-400">{t.wishlistEmptyDesc}</p>
          </div>
          <Link 
            to="/shop" 
            className="inline-block bg-black text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 rounded-xl transition-all shadow-sm"
          >
            {t.browseGalleryBtn}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            const categoryName = typeof product.categoryID === 'object' && product.categoryID 
              ? (product.categoryID as any).name 
              : (language === 'ar' ? 'مجموعة غير محددة' : 'Uncategorized');

            return (
              <div key={product._id} className="group relative flex flex-col justify-between bg-white p-3 rounded-3xl border border-neutral-100/40 hover:shadow-md transition-all duration-300">
                <div>
                  
                  <div className="aspect-[3/4] bg-[#F3F3F3] overflow-hidden relative mb-4 rounded-2xl border border-neutral-100/50">
                    <img
                      src={product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                      }}
                      className={`absolute top-3 bg-white/95 backdrop-blur-md hover:bg-red-50 text-red-500 w-8 h-8 rounded-full transition-all shadow-sm flex items-center justify-center cursor-pointer z-10 ${language === 'ar' ? 'right-3' : 'left-3'}`}
                      title={t.removeFromWishlistTooltip}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1 block">
                    {categoryName}
                  </span>
                  <h3 className="text-[13px] font-bold text-neutral-900 mb-1 group-hover:text-black transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                    {product.description}
                  </p>
                </div>

                <div className="mt-auto pt-2 border-t border-neutral-50">
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-neutral-400">{t.priceLabel}</span>
                    <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                      {formatPrice(product.price)}
                    </span>
                  </div>

               
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    {t.addToCartBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
