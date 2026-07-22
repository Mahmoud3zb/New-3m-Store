import React, { useState, useRef } from 'react';
import { X, Upload, Mail, Lock, User as UserIcon, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setUser = useAuthStore((state) => state.setUser);
  const { language } = useLanguageStore();
  const t = translations[language];

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    street: '',
    city: '',
    country: language === 'ar' ? 'مصر' : 'Egypt',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrors({});
    setSuccessMessage('');
    setForgotEmail('');
    onClose();
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const data = await authService.forgotPassword(forgotEmail);
      setSuccessMessage(data.message || (language === 'ar' ? 'تم إرسال رابط تعيين كلمة المرور بنجاح! يرجى مراجعة بريدك الإلكتروني.' : 'Password reset link sent successfully! Please check your email.'));
      toast.success(language === 'ar' ? 'تم إرسال رابط تعيين كلمة المرور بنجاح!' : 'Password reset link sent successfully!');
      setForgotEmail('');
      setActiveTab('login');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || (language === 'ar' ? 'فشل إرسال رابط تعيين كلمة المرور. يرجى التأكد من البريد الإلكتروني.' : 'Failed to send password reset link. Please check your email.');
      setErrors({ general: errMsg });
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const data = await authService.login(loginData);
      setUser(data.user);
      toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح! مرحباً بك.' : 'Logged in successfully! Welcome.');
      handleClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        const backendErrors: { field: string; message: string }[] = err.response.data.errors;
        const mapped: { [key: string]: string } = {};
        backendErrors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setErrors(mapped);
        toast.error(language === 'ar' ? 'يرجى مراجعة الأخطاء الموضحة باللون الأحمر.' : 'Please review errors highlighted in red.');
      } else {
        const errMsg = err.response?.data?.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.' : 'Login failed. Please verify your credentials.');
        setErrors({ general: errMsg });
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const data = await authService.register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        address: {
          street: registerData.street,
          city: registerData.city,
          country: registerData.country,
        },
        profileImage: profileImage || undefined,
      });

      // 1. Clear register form
      setRegisterData({
        name: '',
        email: '',
        password: '',
        street: '',
        city: '',
        country: language === 'ar' ? 'مصر' : 'Egypt',
      });
      setProfileImage(null);

      // 2. Auto-fill login email and clear password
      setLoginData({ email: registerData.email, password: '' });

      // 3. Switch to login tab
      setActiveTab('login');

      // 4. Set Success Message
      setSuccessMessage(data.message || (language === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب، ويمكنك الآن تسجيل الدخول.' : 'Account created successfully! Please check your email to verify your account, then you can log in.'));
      toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى تأكيد البريد الإلكتروني.' : 'Account created successfully! Please verify your email.');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        const backendErrors: { field: string; message: string }[] = err.response.data.errors;
        const mapped: { [key: string]: string } = {};
        backendErrors.forEach((e) => {
          const fieldName = e.field.replace('address.', '');
          mapped[fieldName] = e.message;
        });
        setErrors(mapped);
        toast.error(language === 'ar' ? 'يرجى مراجعة أخطاء التسجيل الموضحة باللون الأحمر.' : 'Please review registration errors highlighted in red.');
      } else {
        const errMsg = err.response?.data?.message || (language === 'ar' ? 'فشل تسجيل الحساب. يرجى المحاولة لاحقاً.' : 'Failed to register account. Please try again later.');
        setErrors({ general: errMsg });
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
    
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
      />

     
      <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100/50 flex flex-col z-10 overflow-hidden transform transition-all duration-300 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        
       
        <div className={`px-6 pt-6 pb-2 flex items-center border-b border-gray-50 ${language === 'ar' ? 'flex-row-reverse justify-between' : 'flex-row justify-between'}`}>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 transition-all rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-800 tracking-wider">
            {activeTab === 'login' ? t.welcomeBack : t.createNewAccount}
          </span>
        </div>

       
        <div className="px-6 mt-4">
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrors({}); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-xs font-bold tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'login' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrors({}); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-xs font-bold tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'register' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.signUp}
            </button>
          </div>
        </div>

      
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {successMessage && (
            <div className="mb-5 p-3.5 bg-green-50 border-r-4 border-green-500 rounded-xl text-green-700 text-xs font-semibold leading-relaxed">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-5 p-3.5 bg-red-50/80 border-r-4 border-red-500 rounded-xl text-red-600 text-xs font-semibold leading-relaxed">
              {errors.general}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold text-gray-600 mb-2 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.emailLabel}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-gray-400 ${language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'}`}>
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={`w-full py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                </div>
                {errors.email && <p className={`mt-1.5 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.email}</p>}
              </div>

              <div>
                <div className={`flex justify-between items-center mb-2 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>
                  <label className="block text-xs font-bold text-gray-600">{t.passwordLabel}</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrors({}); setSuccessMessage(''); }}
                    className="text-[10px] text-neutral-400 hover:text-black font-bold transition-all cursor-pointer"
                  >
                    {t.forgotPasswordQuestion}
                  </button>
                </div>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-gray-400 ${language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'}`}>
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`w-full py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
                {errors.password && <p className={`mt-1.5 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:scale-100 cursor-pointer mt-6 shadow-sm mb-4"
              >
                {loading ? t.loadingLabel : t.signIn}
              </button>

              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-150"></div>
                </div>
                <span className="relative px-4 bg-white text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {t.orLabel}
                </span>
              </div>

              <div className="flex justify-center w-full min-h-[44px]">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      setLoading(true);
                      try {
                        const res = await authService.googleLogin(credentialResponse.credential);
                        setUser(res.user);
                        toast.success('تم تسجيل الدخول بنجاح عبر جوجل!');
                        handleClose();
                      } catch (err: any) {
                        console.error(err);
                        toast.error(err.response?.data?.message || 'فشل تسجيل الدخول عبر جوجل.');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  onError={() => {
                    toast.error('حدث خطأ أثناء الاتصال بجوجل.');
                  }}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                  width="360"
                />
              </div>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold text-gray-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.fullNameLabel}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-gray-400 ${language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'}`}>
                    <UserIcon className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className={`w-full py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>
                {errors.name && <p className={`mt-1 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.name}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold text-gray-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.emailLabel}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-gray-400 ${language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'}`}>
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className={`w-full py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                </div>
                {errors.email && <p className={`mt-1 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold text-gray-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.passwordLabel}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-gray-400 ${language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'}`}>
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className={`w-full py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
                {errors.password && <p className={`mt-1 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.password}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold text-gray-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.cityLabel}</label>
                  <input
                    type="text"
                    required
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    placeholder={t.cityPlaceholder}
                  />
                  {errors.city && <p className={`mt-1 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.city}</p>}
                </div>
                <div>
                  <label className={`block text-xs font-bold text-gray-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.countryLabel}</label>
                  <input
                    type="text"
                    required
                    value={registerData.country}
                    onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    placeholder={t.countryPlaceholder}
                  />
                  {errors.country && <p className={`mt-1 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.country}</p>}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold text-gray-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.addressLabel}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-gray-400 ${language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'}`}>
                    <MapPin className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={registerData.street}
                    onChange={(e) => setRegisterData({ ...registerData, street: e.target.value })}
                    className={`w-full py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                    placeholder={t.addressPlaceholder}
                  />
                </div>
                {errors.street && <p className={`mt-1 text-xs text-red-500 font-bold ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{errors.street}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold text-gray-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.profileImageLabel}</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-50/50 hover:bg-gray-50 border border-dashed border-gray-300 rounded-2xl py-3 px-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                >
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">
                    {profileImage ? profileImage.name : t.profileImagePlaceholder}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:scale-100 cursor-pointer mt-6 shadow-sm mb-4"
              >
                {loading ? t.loadingLabel : t.signUp}
              </button>

              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-150"></div>
                </div>
                <span className="relative px-4 bg-white text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  أو
                </span>
              </div>

              <div className="flex justify-center w-full min-h-[44px]">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      setLoading(true);
                      try {
                        const res = await authService.googleLogin(credentialResponse.credential);
                        setUser(res.user);
                        toast.success('تم تسجيل الدخول بنجاح عبر جوجل!');
                        handleClose();
                      } catch (err: any) {
                        console.error(err);
                        toast.error(err.response?.data?.message || 'فشل تسجيل الدخول عبر جوجل.');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  onError={() => {
                    toast.error(language === 'ar' ? 'حدث خطأ أثناء الاتصال بجوجل.' : 'An error occurred while connecting to Google.');
                  }}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="pill"
                  width="360"
                  logo_alignment="left"
                />
              </div>
            </form>
          )}

          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div className="text-center space-y-1.5 mb-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t.forgotInstructions}
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold text-gray-600 mb-2 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.emailLabel}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-gray-400 ${language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'}`}>
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`w-full py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all ${language === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:scale-100 cursor-pointer mt-6 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? t.submittingLabel : t.sendResetLink}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrors({}); setSuccessMessage(''); }}
                  className="text-xs text-neutral-400 hover:text-black font-bold transition-all cursor-pointer"
                >
                  {t.backToLogin}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
