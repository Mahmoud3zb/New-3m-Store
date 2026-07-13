import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { orderService } from '../../services/orderService';
import type { IOrder } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { Loader2, CreditCard, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1c1917',
      fontFamily: '"Geist", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#a8a29e',
      },
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
};

function CheckoutPaymentForm({ orderID }: { orderID: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [order, setOrder] = useState<IOrder | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [paying, setPaying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrderAndCreateIntent = async () => {
      try {
        setLoading(true);
        setError('');
        
        const orderData = await orderService.getOrderById(orderID);
        setOrder(orderData);

        const intentRes = await paymentService.createPaymentIntent(
          orderData.totalPrice,
          orderID
        );
        setClientSecret(intentRes.clientSecret);
      } catch (err: any) {
        console.error('Failed to init payment:', err);
        setError(err.response?.data?.message || t.initPaymentError);
      } finally {
        setLoading(false);
      }
    };

    if (orderID) {
      fetchOrderAndCreateIntent();
    }
  }, [orderID, t.initPaymentError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setPaying(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not loaded');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: order?.userID?.name || 'Customer',
              email: order?.userID?.email || '',
            },
          },
        }
      );

      if (stripeError) {
        console.error('Stripe payment error:', stripeError);
        setError(stripeError.message || t.paymentGatewayError);
        toast.error(stripeError.message || t.paymentGenericError);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success(t.paymentSuccessToast);
        navigate(`/checkout/success?orderID=${orderID}`);
      } else {
        setError(t.paymentUnknownStatus);
        toast.error(t.paymentUnexpectedError);
      }
    } catch (err: any) {
      console.error(err);
      setError(t.paymentGatewayError);
      toast.error(t.paymentGenericError);
    } finally {
      setPaying(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
        <p className="text-xs text-neutral-500 font-bold">{t.loadingPaymentGateway}</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="bg-red-50/50 border border-red-100 text-red-600 p-6 rounded-2xl text-xs font-bold text-center space-y-4">
        <p>⚠️ {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] hover:bg-neutral-800 transition-all font-bold cursor-pointer"
        >
          {t.retryBtn}
        </button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-start ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neutral-600" />
              {t.cardPaymentDetailsTitle}
            </h3>
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.secureSslNotice}
            </span>
          </div>

          {error && (
            <div className="bg-red-50/50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">{t.cardInfoLabel}</label>
              <div className="border border-neutral-200 hover:border-neutral-300 focus-within:border-black transition-all p-4 rounded-xl bg-neutral-50/30" dir="ltr">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
              <p className="text-[9px] text-neutral-400">{t.cardAcceptNotice}</p>
            </div>

            <button
              type="submit"
              disabled={paying || !stripe}
              className="w-full bg-[#111] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  {t.processingPayment}
                </>
              ) : (
                <>
                  {t.payBtnText.replace('{amount}', order ? formatPrice(order.totalPrice) : '')}
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      
      <div className="lg:col-span-5 bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 space-y-6 lg:sticky lg:top-28">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4">
          {t.pendingOrderSummaryTitle}
        </h3>

        <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
          {order?.items.map((item: any) => {
            const product = item.productID;
            if (!product) return null;

            return (
              <div key={product._id} className="flex gap-4 items-center">
                <div className="w-12 h-16 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
                  <img 
                    src={product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h4>
                  <span className="text-[10px] text-neutral-400 font-serif-en block mt-0.5">
                    {item.quantity} × {formatPrice(item.price)}
                  </span>
                </div>
                <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-neutral-100 pt-4 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">{t.shippingMethodLabel}</span>
            <span className="text-green-600 font-bold">{t.freeFastShipping}</span>
          </div>
          
          <div className="border-t border-neutral-100 pt-4 flex justify-between items-center text-sm font-bold">
            <span className="text-neutral-900">{t.totalPriceLabel}</span>
            <span className="text-black font-serif-en text-base" dir="ltr">
              {order ? formatPrice(order.totalPrice) : ''}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

export function PaymentView() {
  const [searchParams] = useSearchParams();
  const orderID = searchParams.get('orderID');
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language];

  if (!orderID) {
    return (
      <div className={`pt-32 pb-20 px-6 max-w-xl mx-auto min-h-[70vh] text-center space-y-6`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100">
          <CreditCard className="w-6 h-6 text-neutral-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-800">{t.unknownOrderTitle}</h2>
          <p className="text-xs text-neutral-400">{t.unknownOrderDesc}</p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {t.continueShoppingBtn}
          <ArrowLeft className={`w-3.5 h-3.5 ${language === 'en' ? 'rotate-180' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-[85vh] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-10 border-b border-neutral-100 pb-6">
        <h1 className="text-2xl md:text-3xl font-serif-en uppercase tracking-widest text-neutral-900 mb-2">
          {t.securePaymentGateTitle}
        </h1>
        <p className="text-xs text-neutral-400 uppercase tracking-wider">
          {t.securePaymentGateDesc}
        </p>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutPaymentForm orderID={orderID} />
      </Elements>
    </div>
  );
}
