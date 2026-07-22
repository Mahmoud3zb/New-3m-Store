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

      {order && order.paymentMethod === 'cash' && (
        <div className="bg-emerald-50/40 border border-emerald-100/70 rounded-3xl p-6 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.432.002 9.851-4.388 9.854-9.779.002-2.611-1.013-5.066-2.86-6.917C16.42 1.988 13.973.974 11.36.974c-5.436 0-9.858 4.393-9.861 9.784-.001 1.702.449 3.366 1.3 4.828l-1.011 3.687 3.86-1.008zm12.52-5.482c-.318-.16-1.88-.927-2.198-1.043-.318-.116-.55-.174-.782.174-.231.349-.897 1.132-1.1 1.364-.202.231-.405.261-.723.1-.318-.16-1.344-.495-2.56-1.579-.946-.844-1.585-1.887-1.773-2.206-.188-.318-.02-.49.139-.648.143-.142.318-.372.477-.558.158-.186.212-.318.318-.529.106-.212.053-.398-.026-.558-.079-.16-.782-1.887-1.072-2.585-.282-.677-.568-.585-.782-.596-.202-.011-.434-.013-.666-.013-.232 0-.608.087-.927.435-.318.349-1.216 1.19-1.216 2.902 0 1.713 1.246 3.371 1.42 3.604.174.232 2.453 3.746 5.94 5.253.83.358 1.478.572 1.984.733.834.266 1.595.228 2.195.138.669-.101 1.88-.769 2.14-1.478.261-.709.261-1.319.183-1.449-.079-.13-.29-.212-.608-.371z"/>
            </svg>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-800">
              {language === 'ar' ? 'تأكيد أسرع لطلبك!' : 'Faster Confirmation!'}
            </h3>
            <p className="text-[11px] text-emerald-600 leading-relaxed max-w-md mx-auto font-medium">
              {language === 'ar' 
                ? 'لتسريع مراجعة وتجهيز طلبك وتجنب إلغائه، يرجى النقر على الزر أدناه لتأكيد طلبك عبر الواتساب بنقرة واحدة مجاناً.' 
                : 'To speed up order preparation and avoid cancellation, please click the button below to confirm your order via WhatsApp in one click for free.'}
            </p>
          </div>
          <a
            href={`https://wa.me/201006488707?text=${encodeURIComponent(
              language === 'ar'
                ? `السلام عليكم، أود تأكيد طلبي رقم #${order._id} بقيمة ${order.totalPrice} جنيه.`
                : `Hello, I'd like to confirm my order #${order._id} for ${order.totalPrice} EGP.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-black uppercase tracking-wider px-8 py-3.5 rounded-2xl transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.432.002 9.851-4.388 9.854-9.779.002-2.611-1.013-5.066-2.86-6.917C16.42 1.988 13.973.974 11.36.974c-5.436 0-9.858 4.393-9.861 9.784-.001 1.702.449 3.366 1.3 4.828l-1.011 3.687 3.86-1.008zm12.52-5.482c-.318-.16-1.88-.927-2.198-1.043-.318-.116-.55-.174-.782.174-.231.349-.897 1.132-1.1 1.364-.202.231-.405.261-.723.1-.318-.16-1.344-.495-2.56-1.579-.946-.844-1.585-1.887-1.773-2.206-.188-.318-.02-.49.139-.648.143-.142.318-.372.477-.558.158-.186.212-.318.318-.529.106-.212.053-.398-.026-.558-.079-.16-.782-1.887-1.072-2.585-.282-.677-.568-.585-.782-.596-.202-.011-.434-.013-.666-.013-.232 0-.608.087-.927.435-.318.349-1.216 1.19-1.216 2.902 0 1.713 1.246 3.371 1.42 3.604.174.232 2.453 3.746 5.94 5.253.83.358 1.478.572 1.984.733.834.266 1.595.228 2.195.138.669-.101 1.88-.769 2.14-1.478.261-.709.261-1.319.183-1.449-.079-.13-.29-.212-.608-.371z"/>
            </svg>
            {language === 'ar' ? 'تأكيد سريع عبر الواتساب' : 'Express WhatsApp Confirm'}
          </a>
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
