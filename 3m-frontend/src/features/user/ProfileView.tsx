import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import type { IOrder } from '../../services/orderService';
import { authService } from '../../services/authService';
import { Link } from 'react-router-dom';
import { User, ClipboardList, MapPin, Calendar, Clock, CreditCard, ChevronDown, ChevronUp, LogOut, Loader2, Camera, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

export function ProfileView() {
  const { user, isAuthenticated, logout, openAuthModal, setUser } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [expandedOrderID, setExpandedOrderID] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(t.uploadImgError);
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const res = await authService.updateProfileImage(file);
      setUser(res.data);
    } catch (err: any) {
      console.error('Failed to upload profile image:', err);
      setUploadError(
        err.response?.data?.message || t.uploadImgErrorDefault
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    if (!editedName.trim()) {
      toast.error(t.nameEmptyError);
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await userService.updateUser(user._id, { name: editedName });
      setUser({ ...user, name: res.data.name });
      setIsEditingProfile(false);
      toast.success(t.profileUpdateSuccess);
    } catch (err: any) {
      console.error('Failed to update profile name:', err);
      toast.error(err.response?.data?.message || t.profileUpdateError);
    } finally {
      setIsSavingProfile(false);
    }
  };

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.orderStatusPending;
      case 'processing': return t.orderStatusProcessing;
      case 'shipped': return t.orderStatusShipped;
      case 'delivered': return t.orderStatusDelivered;
      default: return status;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100/50';
      case 'processing':
        return 'bg-blue-50 text-blue-600 border-blue-100/50';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100/50';
      case 'delivered':
        return 'bg-green-50 text-green-600 border-green-100/50';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-100/50';
    }
  };

  const toggleOrderDetails = (orderID: string) => {
    setExpandedOrderID(expandedOrderID === orderID ? null : orderID);
  };

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
          
         
          {activeTab === 'profile' && (
            <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
              
              <div className="flex flex-col md:flex-row items-center gap-6 border-b border-neutral-50 pb-6">
                <div className="relative group/avatar w-20 h-20 bg-neutral-50 border border-neutral-100 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                  ) : (user?.profileImage && !user.profileImage.includes('default-avatar')) ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-2xl font-black font-serif-en text-neutral-800 uppercase">
                      {user?.name?.charAt(0)}
                    </span>
                  )}
                  
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                    <Camera className="w-5 h-5 text-white/90 hover:scale-110 transition-transform" />
                  </label>
                </div>
                
                <div className={`text-center md:text-right space-y-1 ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-lg font-bold text-neutral-900">{user?.name}</h3>
                  <span className="text-xs text-neutral-400 font-sans block">{user?.email}</span>
                  <span className="inline-block bg-neutral-100 text-neutral-600 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {user?.role === 'admin' ? t.roleAdmin : t.roleCustomer}
                  </span>
                  {uploadError && (
                    <span className="text-[10px] text-red-500 font-bold block pt-1">{uploadError}</span>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-neutral-400 block font-bold">{t.usernameLabel}</span>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className={`w-full bg-white border border-neutral-250 text-neutral-850 px-4 py-3 rounded-xl font-bold focus:outline-none focus:border-black transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        disabled={isSavingProfile}
                      />
                    ) : (
                      <p className="bg-neutral-50/50 border border-neutral-100 text-neutral-800 px-4 py-3 rounded-xl font-bold">
                        {user?.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-neutral-400 block font-bold">{t.emailAddressLabel}</span>
                    <p className="bg-neutral-50/50 border border-neutral-100 text-neutral-450 px-4 py-3 rounded-xl font-sans font-bold cursor-not-allowed text-left" dir="ltr">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className={`flex justify-end gap-3 pt-2 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                  {isEditingProfile ? (
                    <>
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:bg-neutral-400"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {t.savingChanges}
                          </>
                        ) : (
                          t.saveChangesBtn
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditedName(user?.name || '');
                        }}
                        disabled={isSavingProfile}
                        className="bg-white border border-neutral-200 text-neutral-600 px-6 py-3 rounded-xl text-xs font-bold hover:bg-neutral-50 hover:text-black transition-all cursor-pointer"
                      >
                        {t.cancelBtn}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {t.editProfileBtn}
                    </button>
                  )}
                </div>
              </form>

            </div>
          )}

       
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {isLoadingOrders ? (
                <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
                  <p className="text-xs text-neutral-400 font-bold">{t.loadingOrders}</p>
                </div>
              ) : orders.length === 0 ? (
              
                <div className="bg-white border border-neutral-100 rounded-3xl p-12 md:p-16 text-center shadow-sm space-y-6">
                  <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100">
                    <ClipboardList className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-neutral-800">{t.noOrdersTitle}</h3>
                    <p className="text-xs text-neutral-400">{t.noOrdersDesc}</p>
                  </div>
                  <Link 
                    to="/shop" 
                    className="inline-block bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 rounded-xl transition-all shadow-sm"
                  >
                    {t.startShoppingBtn}
                  </Link>
                </div>
              ) : (
                
                orders.map((order) => (
                  <div 
                    key={order._id} 
                    className="bg-white border border-neutral-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300"
                  >
                  
                    <div 
                      onClick={() => toggleOrderDetails(order._id)}
                      className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-neutral-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-neutral-800 font-serif-en">#{order._id}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-neutral-400">
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
                          <span className="text-[9px] text-neutral-400 block">{t.orderTotalLabel}</span>
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
                              {t.shippingAddressTitle}
                            </span>
                            <p className="text-neutral-800 font-medium">
                              {order.shippingAddress.city}، {order.shippingAddress.street}
                            </p>
                            <p className="text-neutral-500 font-serif-en">{order.shippingAddress.phone}</p>
                          </div>
                          
                          <div className={`space-y-1 border-t md:border-t-0 ${language === 'ar' ? 'md:border-r md:pr-4' : 'md:border-l md:pl-4'} border-neutral-50 pt-3.5 md:pt-0`}>
                            <span className="text-neutral-400 font-bold flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
                              {t.paymentDetailsTitle}
                            </span>
                            <div className="flex flex-col gap-1.5 mt-1">
                              <p className="text-neutral-800 font-medium">
                                {order.paymentMethod === 'cash' ? t.paymentCash : t.paymentCard}
                              </p>
                              <div>
                                {order.isPaid ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    {t.paymentPaid}
                                  </span>
                                ) : order.paymentMethod === 'card' ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                      {t.paymentUnpaid}
                                    </span>
                                    <Link 
                                      to={`/checkout/payment?orderID=${order._id}`}
                                      className="text-[10px] text-black font-extrabold hover:underline bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-lg transition-all"
                                    >
                                      {t.payNowBtn}
                                    </Link>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                    {t.paymentCodPending}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      
                        <div className="space-y-3">
                          <span className="text-[10px] text-neutral-400 font-bold block">{t.orderItemsTitle}</span>
                          
                          <div className="space-y-2.5">
                            {order.items.map((item, index) => (
                              <div 
                                key={index} 
                                className="flex justify-between items-center bg-white border border-neutral-50/80 p-3 rounded-2xl"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-12 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-100 flex-shrink-0">
                                    <img 
                                      src={item.productID?.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                                      alt="منتج" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-neutral-800 block truncate max-w-[200px] md:max-w-md">
                                      {item.productID?.name || t.productUnavailable}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-serif-en">
                                      {t.quantityLabel}: {item.quantity} × {formatPrice(item.price)}
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
                ))
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
