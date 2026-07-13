import React from 'react';
import { 
  ClipboardList, 
  Loader2, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  CreditCard 
} from 'lucide-react';
import type { IOrder } from '../../../services/orderService';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

interface OrdersTabProps {
  orders: IOrder[];
  loadingOrders: boolean;
  expandedOrderID: string | null;
  setExpandedOrderID: (id: string | null) => void;
  handleStatusChange: (orderId: string, newStatus: string) => void;
  formatPrice: (price: number) => string;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  loadingOrders,
  expandedOrderID,
  setExpandedOrderID,
  handleStatusChange,
  formatPrice,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-neutral-800">{t.adminOrdersTitle}</h2>
        <span className="text-xs text-neutral-400 font-serif-en">{orders.length} {t.adminTotalOrders}</span>
      </div>

      {loadingOrders ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
          <p className="text-xs text-neutral-400 font-bold">
            {language === 'ar' ? 'جاري تحميل سجل الطلبات...' : 'Loading order history...'}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center shadow-sm space-y-3">
          <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-xs text-neutral-400">{t.adminOrderNoOrders}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className={`bg-white border border-neutral-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 ${language === 'ar' ? 'text-right' : 'text-left'}`}
            >
              {/* Order Row */}
              <div 
                onClick={() => setExpandedOrderID(expandedOrderID === order._id ? null : order._id)}
                className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-neutral-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-neutral-800 font-serif-en">#{order._id}</span>
                    <span className="text-xs text-neutral-500 font-medium">({order.userID?.name || t.adminOrderCustomerUnknown})</span>
                    
                    
                    <div onClick={e => e.stopPropagation()} className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                          order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          order.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          order.status === 'shipped' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-green-50 text-green-600 border-green-100'
                        }`}
                      >
                        <option value="pending">{t.adminOrderStatusPending}</option>
                        <option value="processing">{t.adminOrderStatusProcessing}</option>
                        <option value="shipped">{t.adminOrderStatusShipped}</option>
                        <option value="delivered">{t.adminOrderStatusDelivered}</option>
                      </select>
                    </div>
 
                    {order.isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[9px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        {t.adminOrderPaid}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                        {t.adminOrderUnpaid}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-6 ${language === 'ar' ? 'mr-auto md:mr-0' : 'ml-auto md:ml-0'} w-full md:w-auto justify-between md:justify-end`}>
                  <div className={language === 'ar' ? 'text-left md:text-right' : 'text-right md:text-left'}>
                    <span className="text-[9px] text-neutral-400 block">{t.adminOrderTotalAmount}</span>
                    <span className="text-xs font-extrabold text-neutral-900 font-serif-en" dir="ltr">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                  
                  <div className="text-neutral-400 p-1">
                    {expandedOrderID === order._id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {expandedOrderID === order._id && (
                <div className="border-t border-neutral-50 bg-neutral-50/20 p-5 md:p-6 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] bg-white border border-neutral-100 rounded-2xl p-4">
                    <div className="space-y-1">
                      <span className="text-neutral-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                        {t.adminShippingAddress}
                      </span>
                      <p className="text-neutral-800 font-medium">
                        {order.shippingAddress?.city}، {order.shippingAddress?.street}
                      </p>
                      <p className="text-neutral-500 font-serif-en">{order.shippingAddress?.phone}</p>
                    </div>
                    
                    <div className={`space-y-1 border-t md:border-t-0 ${language === 'ar' ? 'md:border-r md:pr-4' : 'md:border-l md:pl-4'} border-neutral-50 pt-3.5 md:pt-0`}>
                      <span className="text-neutral-400 font-bold flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
                        {t.adminPaymentMethod}
                      </span>
                      <p className="text-neutral-800 font-medium">
                        {order.paymentMethod === 'cash' 
                          ? (language === 'ar' ? '💵 الدفع عند الاستلام (Cash)' : '💵 Cash on Delivery') 
                          : (language === 'ar' ? '💳 بطاقة ائتمانية (Stripe)' : '💳 Credit Card (Stripe)')
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] text-neutral-400 font-bold block">{t.adminOrderContents}</span>
                    <div className="space-y-2.5">
                      {order.items?.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center bg-white border border-neutral-50/80 p-3 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-12 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-100 flex-shrink-0">
                              <img 
                                src={item.productID?.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                                alt="product" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-neutral-800 block truncate max-w-[200px] md:max-w-md">
                                {item.productID?.name || t.adminDeletedProduct}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-serif-en">
                                {t.adminOrderQty}{item.quantity} × {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                          
                          <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};






