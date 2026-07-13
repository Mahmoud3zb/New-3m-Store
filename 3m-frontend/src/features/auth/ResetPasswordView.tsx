import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

export function ResetPasswordView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const { language } = useLanguageStore();
  const t = translations[language];

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || (language === 'ar' ? 'فشلت عملية إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية.' : 'Password reset failed. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`pt-32 pb-20 px-6 max-w-md mx-auto min-h-[75vh] flex flex-col justify-center ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100 mb-2">
          {success ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <KeyRound className="w-6 h-6 text-neutral-800" />
          )}
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-800">{t.passwordResetSuccess}</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t.passwordResetSuccessDesc}
              </p>
            </div>
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  openAuthModal();
                }, 300);
              }}
              className="w-full bg-black text-white py-3.5 rounded-2xl text-xs font-bold hover:bg-neutral-800 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              {t.loginNow}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1.5 mb-2">
              <h2 className="text-lg font-bold text-neutral-800">{t.resetPasswordTitle}</h2>
              <p className="text-xs text-neutral-400">{t.enterNewPassword}</p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50/80 border-r-4 border-red-500 rounded-xl text-red-600 text-xs font-semibold leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className={`block text-xs font-bold text-neutral-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.newPasswordLabel}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
                dir="ltr"
              />
            </div>

            <div className="space-y-1">
              <label className={`block text-xs font-bold text-neutral-600 mb-1.5 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.confirmNewPasswordLabel}</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/80 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none text-sm transition-all font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:scale-100 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.resettingPassword}</span>
                </>
              ) : (
                <span>{t.resetPasswordBtn}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
