import React from 'react';
import { 
  ClipboardList, 
  Loader2, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  CreditCard,
  Download
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
  handlePaymentStatusToggle: (orderId: string, isPaid: boolean) => void;
  formatPrice: (price: number) => string;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  loadingOrders,
  expandedOrderID,
  setExpandedOrderID,
  handleStatusChange,
  handlePaymentStatusToggle,
  formatPrice,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const handlePrintInvoice = (order: IOrder) => {
    const isAr = language === 'ar';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: ${isAr ? 'right' : 'left'};">${item.productID?.name || (isAr ? 'منتج غير متوفر' : 'Unavailable Product')}</td>
        <td style="padding: 10px; text-align: center;">${item.size || 'N/A'}</td>
        <td style="padding: 10px; text-align: center;"><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${item.colorCode}; border: 1px solid #ddd; vertical-align: middle;"></span></td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: ${isAr ? 'left' : 'right'};">${item.price} EGP</td>
        <td style="padding: 10px; text-align: ${isAr ? 'left' : 'right'}; font-weight: bold;">${item.price * item.quantity} EGP</td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${order._id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; tracking: 0.1em; }
          .title { font-size: 20px; font-weight: bold; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 13px; line-height: 1.6; }
          .details div { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px; }
          th { background-color: #f9f9f9; padding: 12px 10px; border-bottom: 1px solid #ddd; font-weight: bold; }
          .totals { margin-${isAr ? 'right' : 'left'}: auto; width: 300px; font-size: 14px; line-height: 2; }
          .totals div { display: flex; justify-content: space-between; }
          .totals .final { font-size: 16px; font-weight: bold; border-top: 1.5px solid #333; padding-top: 5px; margin-top: 5px; }
          .footer { text-align: center; font-size: 11px; color: #777; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">3M STORE</div>
            <div style="font-size: 12px; color: #777; margin-top: 5px;">Boutique Clothing & Apparel</div>
          </div>
          <div style="text-align: ${isAr ? 'left' : 'right'};">
            <div class="title">${isAr ? 'فاتورة طلب شراء' : 'ORDER INVOICE'}</div>
            <div style="font-size: 12px; color: #777; margin-top: 5px;">#${order._id}</div>
          </div>
        </div>

        <div class="details">
          <div>
            <strong>${isAr ? 'العميل:' : 'Customer Details:'}</strong>
            <div>${order.userID?.name || (isAr ? 'عميل غير معروف' : 'Unknown')}</div>
            <div>${order.userID?.email || ''}</div>
            <div>${order.shippingAddress?.phone}</div>
          </div>
          <div style="text-align: center;">
            <strong>${isAr ? 'تاريخ الطلب:' : 'Order Date:'}</strong>
            <div>${new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</div>
            <div>${new Date(order.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div style="text-align: ${isAr ? 'left' : 'right'};">
            <strong>${isAr ? 'عنوان الشحن:' : 'Shipping Address:'}</strong>
            <div>${order.shippingAddress?.city}</div>
            <div>${order.shippingAddress?.street}</div>
            <div>${order.paymentMethod === 'cash' ? (isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery') : (isAr ? 'بطاقة ائتمانية' : 'Credit Card')}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: ${isAr ? 'right' : 'left'};">${isAr ? 'المنتج' : 'Product'}</th>
              <th>${isAr ? 'المقاس' : 'Size'}</th>
              <th>${isAr ? 'اللون' : 'Color'}</th>
              <th>${isAr ? 'الكمية' : 'Qty'}</th>
              <th style="text-align: ${isAr ? 'left' : 'right'};">${isAr ? 'سعر القطعة' : 'Unit Price'}</th>
              <th style="text-align: ${isAr ? 'left' : 'right'};">${isAr ? 'الإجمالي' : 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div>
            <span>${isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
            <span>${order.totalPrice - (order.paymentMethod === 'cash' ? 100 : 0)} EGP</span>
          </div>
          <div>
            <span>${isAr ? 'تكلفة الشحن:' : 'Shipping Fee:'}</span>
            <span>${order.paymentMethod === 'cash' ? 100 : 0} EGP</span>
          </div>
          <div class="final">
            <span>${isAr ? 'الإجمالي النهائي:' : 'Final Total:'}</span>
            <span>${order.totalPrice} EGP</span>
          </div>
        </div>

        <div class="footer">
          <p>${isAr ? 'شكراً لتسوقكم معنا!' : 'Thank you for shopping with us!'}</p>
          <p>www.3m-store.com</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const timelineStatuses = ['pending', 'processing', 'shipped', 'delivered'];
  const statusLabelsAr: Record<string, string> = {
    pending: 'معلق',
    processing: 'تجهيز',
    shipped: 'شحن',
    delivered: 'توصيل'
  };
  const statusLabelsEn: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered'
  };

  const getStatusStepIndex = (status: string) => {
    const idx = timelineStatuses.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

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
 
                    <div className="flex items-center gap-1.5">
                      <select
                        value={order.isPaid ? 'paid' : 'unpaid'}
                        onChange={(e) => handlePaymentStatusToggle(order._id, e.target.value === 'paid')}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-xl border focus:outline-none transition-all cursor-pointer ${
                          order.isPaid 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="unpaid">{language === 'ar' ? 'معلق / غير مدفوع' : 'Unpaid'}</option>
                        <option value="paid">{language === 'ar' ? 'تم الدفع / مدفوع' : 'Paid'}</option>
                      </select>
                    </div>
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

                  {/* Order Status Timeline */}
                  <div className="bg-white border border-neutral-100 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] text-neutral-450 font-bold block">
                      {language === 'ar' ? 'مسار حالة الطلب:' : 'Order Progress Timeline:'}
                    </span>
                    <div className="relative flex justify-between items-center max-w-md mx-auto pt-2 pb-5">
                      {/* Connection Line */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-100 -z-10" />
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-900 transition-all duration-500 -z-10" 
                        style={{ 
                          width: `${(getStatusStepIndex(order.status) / (timelineStatuses.length - 1)) * 100}%`,
                          [language === 'ar' ? 'right' : 'left']: 0,
                          [language === 'ar' ? 'left' : 'right']: 'auto',
                        }} 
                      />

                      {timelineStatuses.map((step, index) => {
                        const stepIndex = getStatusStepIndex(order.status);
                        const isCompleted = index <= stepIndex;
                        const isActive = index === stepIndex;
                        return (
                          <div key={step} className="flex flex-col items-center space-y-1.5 relative">
                            <div 
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-[10px] font-bold ${
                                isCompleted 
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
                                  : 'bg-white border-neutral-200 text-neutral-400'
                              } ${isActive ? 'ring-4 ring-neutral-900/10 scale-110' : ''}`}
                            >
                              {index + 1}
                            </div>
                            <span 
                              className={`text-[9px] font-bold absolute -bottom-5 whitespace-nowrap transition-colors ${
                                isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                              }`}
                            >
                              {language === 'ar' ? statusLabelsAr[step] : statusLabelsEn[step]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-[10px] text-neutral-400 font-bold block">{t.adminOrderContents}</span>
                      <button 
                        onClick={() => handlePrintInvoice(order)}
                        className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-neutral-200/50"
                      >
                        <Download className="w-3 h-3" />
                        {language === 'ar' ? 'تحميل الفاتورة PDF' : 'Download Invoice PDF'}
                      </button>
                    </div>
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
                              <span className="text-[10px] text-neutral-400 font-serif-en block">
                                {t.adminOrderQty}{item.quantity} × {formatPrice(item.price)}
                              </span>
                              <div className="flex items-center gap-2 mt-1 text-[9px] text-neutral-500 font-medium">
                                <span>{language === 'ar' ? `المقاس: ${item.size}` : `Size: ${item.size}`}</span>
                                <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                                <span className="flex items-center gap-1">
                                  {language === 'ar' ? 'اللون:' : 'Color:'}
                                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-200 inline-block align-middle" style={{ backgroundColor: item.colorCode }} />
                                </span>
                              </div>
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






