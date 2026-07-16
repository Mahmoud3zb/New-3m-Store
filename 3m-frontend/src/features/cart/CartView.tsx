import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, LogIn } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

export function CartView() {
  const { items, totalCartPrice, removeItem, updateItemQuantity, clearCart, isLoading } = useCartStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (productID: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty >= 1) {
      updateItemQuantity(productID, newQty);
    }
  };

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-[85vh] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      
      <div className={`mb-12 border-b border-neutral-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4`}>
        <div>
          <h1 className="text-3xl font-serif-en uppercase tracking-widest text-neutral-900 mb-2">
            {t.cartTitle}
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            {t.cartSubtitle}
          </p>
        </div>
        
        {items.length > 0 && (
          <button
            onClick={clearCart}
            disabled={isLoading}
            className="text-xs text-neutral-400 hover:text-red-500 font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {t.clearCartBtn}
          </button>
        )}
      </div>

     
      {!isAuthenticated && (
        <div className={`mb-8 bg-neutral-50 border border-neutral-200/60 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:bg-neutral-100/50`}>
          <div className={`space-y-1 text-center ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
            <h4 className="text-xs font-bold text-neutral-900">{t.saveCartTitle}</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {t.saveCartDesc}
            </p>
          </div>
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            {t.loginNow}
          </button>
        </div>
      )}

      {items.length === 0 ? (
      
        <div className="py-24 text-center border border-dashed border-neutral-200 rounded-3xl space-y-5 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-neutral-800">{t.cartEmptyTitle}</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
              {t.cartEmptyDesc}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#111] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl transition-colors cursor-pointer"
          >
            {t.exploreShopBtn}
            <ArrowLeft className={`w-3.5 h-3.5 ${language === 'en' ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      ) : (
       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
         
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const product = item.productID;
              if (!product) return null;

              return (
                <div 
                  key={product._id} 
                  className="flex gap-4 md:gap-6 bg-white border border-neutral-100 p-4 md:p-6 rounded-2xl transition-shadow hover:shadow-sm"
                >
                  
                  <div className="w-20 h-24 md:w-24 md:h-32 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                    <img
                      src={product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                 
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xs md:text-sm font-bold text-neutral-900 line-clamp-1">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => removeItem(product._id)}
                          disabled={isLoading}
                          className="text-neutral-300 hover:text-red-500 transition-colors p-1 cursor-pointer disabled:opacity-50"
                          title={t.removeItemTooltip}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                  
                    <div className="flex justify-between items-center mt-4">
                     
                      <div className="flex items-center border border-neutral-200 rounded-xl px-1.5 py-1 gap-2 bg-neutral-50">
                        <button
                          onClick={() => handleQuantityChange(product._id, item.quantity, -1)}
                          disabled={item.quantity <= 1 || isLoading}
                          className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-200/50 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-serif-en min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product._id, item.quantity, 1)}
                          disabled={isLoading}
                          className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-200/50 rounded-lg transition-all cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                     
                      <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                        <span className="text-[10px] text-neutral-400 block mb-0.5">{t.itemTotalLabel}</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          {product.offer && product.offer.discountedPrice !== undefined && (
                            (() => {
                              const now = new Date();
                              const start = new Date(product.offer.startDate);
                              const end = new Date(product.offer.endDate);
                              if (now >= start && now <= end) {
                                return (
                                  <>
                                    <span className="text-[10px] line-through text-red-500 font-serif-en opacity-70" dir="ltr">
                                      {formatPrice(product.price * item.quantity)}
                                    </span>
                                    <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                                      {formatPrice(product.offer.discountedPrice * item.quantity)}
                                    </span>
                                  </>
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
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 space-y-6 sticky top-28">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4">
              {t.orderSummaryTitle}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">{t.itemCountLabel}</span>
                <span className="font-bold font-serif-en">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">{t.itemsPriceLabel}</span>
                <span className="font-bold font-serif-en" dir="ltr">{formatPrice(totalCartPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">{t.shippingCostLabel}</span>
                <span className="text-neutral-400 font-bold">{t.selectCityForShipping}</span>
              </div>
              
              <div className="border-t border-neutral-100 pt-4 flex justify-between items-center text-sm font-bold">
                <span className="text-neutral-900">{t.totalPriceLabel}</span>
                <span className="text-black font-serif-en text-base" dir="ltr">
                  {formatPrice(totalCartPrice)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/checkout"
                  className="block w-full bg-[#111] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                >
                  {t.checkoutBtn}
                </Link>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {t.loginToCheckoutBtn}
                </button>
              )}
              
              <Link
                to="/shop"
                className="block text-center border border-neutral-200 hover:border-black text-neutral-700 hover:text-black text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer"
              >
                {t.continueShoppingBtn}
              </Link>
            </div>

           
            <div className="border-t border-neutral-100 pt-4 text-[10px] text-neutral-400 leading-relaxed text-center space-y-1">
              <p>{t.securePaymentNotice}</p>
              <p>{t.returnPolicyNotice}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
