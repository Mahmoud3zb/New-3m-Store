import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Heart, ArrowRight, Compass, Eye } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { useSettingsStore } from '../../store/settingsStore';
import { translations } from '../../lib/translations';
import { useEffect } from 'react';

export function AboutView() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const getWhatsAppDisplay = (val: string) => {
    if (!val) return '';
    const match = val.match(/wa\.me\/(\d+)/);
    if (match && match[1]) {
      return `+${match[1]}`;
    }
    return val.replace(/https?:\/\/(www\.)?/, '');
  };

  const getWhatsAppLink = (val: string) => {
    if (!val) return '';
    if (val.startsWith('http://') || val.startsWith('https://')) {
      return val;
    }
    return `https://wa.me/${val.replace(/[^\d+]/g, '')}`;
  };

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-[85vh] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
        <span className="text-[10px] text-neutral-400 uppercase tracking-[0.25em] block">{t.ourHeritage}</span>
        <h1 className="text-3xl md:text-5xl font-serif-en font-black tracking-wider uppercase text-neutral-900 leading-tight">
          {t.aboutTitle}
        </h1>
        <div className="w-12 h-[2px] bg-black mx-auto mt-4"></div>
      </div>

    
      <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-8 md:p-12 mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs text-neutral-400 font-bold block uppercase tracking-wider">{t.aboutBadge}</span>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-950 leading-relaxed">
            {t.aboutHeading}
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            {t.aboutParagraph1}
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            {t.aboutParagraph2}
          </p>
        </div>
        
       
        <div className={`lg:col-span-5 bg-black text-white p-8 rounded-2xl flex flex-col justify-between min-h-[220px] shadow-sm select-none ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="space-y-2">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">{t.brandConcept}</span>
            <h3 className="text-xl font-serif-en tracking-[0.2em] font-black">3M STUDIOS.</h3>
          </div>
          <p className="text-[10px] text-neutral-300 leading-relaxed">
            "{t.brandQuote}"
          </p>
          <div className="border-t border-neutral-800 pt-4 text-[9px] text-neutral-500 tracking-wider">
            SINCE 2026
          </div>
        </div>
      </div>

  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        
     
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 text-neutral-800">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-950">{t.ourVisionTitle}</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t.ourVisionDesc}
          </p>
        </div>

        <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 text-neutral-800">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-950">{t.ourMissionTitle}</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t.ourMissionDesc}
          </p>
        </div>

      </div>

     
      <div className="space-y-10 mb-20">
        <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-4">
          {t.valuesTitle}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
        
          <div className="space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-neutral-950">{t.valueQualityTitle}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {t.valueQualityDesc}
            </p>
          </div>

         
          <div className="space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-neutral-950">{t.valueInnovationTitle}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {t.valueInnovationDesc}
            </p>
          </div>

        
          <div className="space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-800">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-neutral-950">{t.valueCustomerTitle}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {t.valueCustomerDesc}
            </p>
          </div>

        </div>
      </div>

      
      <div className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-12 mb-20 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-neutral-400 uppercase tracking-[0.25em] block">
            {language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-neutral-900">
            {language === 'ar' ? 'يسعدنا دائماً سماع صوتك ومساعدتك' : 'We are always here to help you'}
          </h3>
          <div className="w-8 h-[2px] bg-black mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          {settings?.contactInfo?.phone && (
            <a 
              href={`tel:${settings.contactInfo.phone}`}
              className="group p-6 rounded-2xl bg-neutral-50 hover:bg-neutral-950 hover:text-white border border-neutral-100 transition-all duration-300 flex flex-col items-center space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-900 group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </h4>
                <p className="text-[13px] font-extrabold font-serif-en" dir="ltr">
                  {settings.contactInfo.phone}
                </p>
              </div>
            </a>
          )}

          
          {settings?.contactInfo?.email && (
            <a 
              href={`mailto:${settings.contactInfo.email}`}
              className="group p-6 rounded-2xl bg-neutral-50 hover:bg-neutral-950 hover:text-white border border-neutral-100 transition-all duration-300 flex flex-col items-center space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-900 group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </h4>
                <p className="text-[13px] font-extrabold font-serif-en" dir="ltr">
                  {settings.contactInfo.email}
                </p>
              </div>
            </a>
          )}

          
          {settings?.contactInfo?.whatsapp && (
            <a 
              href={getWhatsAppLink(settings.contactInfo.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-neutral-50 hover:bg-emerald-600 hover:text-white border border-neutral-100 transition-all duration-300 flex flex-col items-center space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-900 group-hover:bg-white text-white group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </h4>
                <p className="text-[13px] font-extrabold font-serif-en" dir="ltr">
                  {getWhatsAppDisplay(settings.contactInfo.whatsapp)}
                </p>
              </div>
            </a>
          )}
        </div>
      </div>
     
      <div className="bg-black text-white text-center py-16 px-6 rounded-3xl space-y-6 shadow-sm">
        <h3 className="text-lg md:text-2xl font-bold">{t.aboutReadyTitle}</h3>
        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          {t.aboutReadyDesc}
        </p>
        <div className="pt-2">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            {t.aboutBrowseBtn}
            <ArrowRight className={`w-3.5 h-3.5 ${language === 'en' ? '' : 'rotate-180'}`} />
          </Link>
        </div>
      </div>

    </div>
  );
}
