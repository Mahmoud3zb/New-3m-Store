import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import type { IOrder } from '../../services/orderService';
import { CheckCircle2, ShoppingBag, ClipboardList, MapPin, Phone, CreditCard, Loader2 } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

export function OrderSuccessView() {
  const [searchParams] = useSearchParams();
  const orderID = searchParams.get('orderID');
  const { language } = useLanguageStore();
  const t = translations[language];
  
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderID) {
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await orderService.getOrderById(orderID);
        setOrder(orderData);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(t.orderFetchError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderID, t.orderFetchError]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className={`pt-32 pb-20 px-6 min-h-[70vh] flex flex-col items-center justify-center space-y-4`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Loader2 className="w-10 h-10 animate-spin text-neutral-800" />
        <p className="text-xs text-neutral-400 font-bold">{t.loadingOrderDetails}</p>
      </div>
    );
  }

  return (
    <div className={`pt-32 pb-20 px-6 max-w-2xl mx-auto min-h-[85vh] text-center space-y-8`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
     
      <div className="space-y-3.5">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100/50 animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-serif-en uppercase tracking-widest text-neutral-900">
            {t.thankYouTitle}
          </h1>
          <h2 className="text-sm font-bold text-neutral-800">{t.orderSuccessHeader}</h2>
          <p className="text-xs text-neutral-400">{t.orderSuccessDesc}</p>
        </div>
      </div>

      {order && (
        <div className={`bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
       
          <div className="flex justify-between items-center border-b border-neutral-50 pb-4">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">{t.orderNumberLabel}</span>
              <span className="text-xs font-bold text-neutral-800 font-serif-en">#{order._id}</span>
            </div>
            <div className={language === 'ar' ? 'text-left' : 'text-right'}>
              <span className="text-[10px] text-neutral-400 uppercase block">{t.orderDateLabel}</span>
              <span className="text-xs font-bold text-neutral-800 font-serif-en">
                {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

       
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-neutral-50 pb-6">
            
            
            <div className="space-y-1.5">
              <span className="text-neutral-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                {t.shippingAddressSuccess}
              </span>
              <p className="text-neutral-800 font-bold leading-relaxed">
                {order.shippingAddress.city}، {order.shippingAddress.street}
              </p>
            </div>

            
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-neutral-400 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-600" />
                  {t.phoneContactSuccess}
                </span>
                <p className="text-neutral-800 font-serif-en font-bold text-left" dir="ltr">{order.shippingAddress.phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-400 font-bold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
                  {t.paymentMethodSuccess}
                </span>
                <p className="text-neutral-800 font-bold">
                  {order.paymentMethod === 'cash' ? t.paymentCodSuccess : t.paymentCardSuccess}
                </p>
              </div>
            </div>

          </div>

       
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-400">{t.itemsRequestedTitle}</h4>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-neutral-50 rounded border border-neutral-100 flex-shrink-0 overflow-hidden">
                      <img 
                        src={item.productID?.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                        alt="منتج" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-neutral-800 block truncate max-w-xs">
                        {item.productID?.name || t.productUnavailable}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-serif-en">
                        {t.quantityLabel}: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 font-serif-en" dir="ltr">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            
            <div className="border-t border-neutral-100 pt-4 flex justify-between items-center text-sm font-bold">
              <span className="text-neutral-900">{t.totalPaidSuccess}</span>
              <span className="text-black font-serif-en text-base" dir="ltr">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 p-4 rounded-xl text-xs">
          ⚠️ {error}
        </div>
      )}

  
      <div className={`flex flex-col sm:flex-row justify-center gap-4 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
        
        <Link 
          to="/profile" 
          className="flex items-center justify-center gap-2 bg-[#111] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <ClipboardList className="w-4 h-4" />
          {t.viewMyOrdersBtn}
        </Link>

        <Link 
          to="/shop" 
          className="flex items-center justify-center gap-2 border border-neutral-200 hover:border-black text-neutral-700 hover:text-black text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          {t.continueShoppingBtn}
        </Link>

      </div>

    </div>
  );
}
