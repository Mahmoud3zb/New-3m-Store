import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useLanguageStore } from '../../../store/languageStore';
import { 
  ShieldAlert, 
  Megaphone, 
  Truck, 
  Share2, 
  Save, 
  Loader2, 
  Mail, 
  Phone,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SettingsTab() {
  const { settings, updateSettings, fetchSettings } = useSettingsStore();
  const { language } = useLanguageStore();
  const isRTL = language === 'ar';

  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [announcementAr, setAnnouncementAr] = useState('');
  const [announcementEn, setAnnouncementEn] = useState('');
  const [announcementBg, setAnnouncementBg] = useState('#000000');
  const [announcementTextCol, setAnnouncementTextCol] = useState('#ffffff');
  
  const [shipCairoGiza, setShipCairoGiza] = useState(50);
  const [shipAlexDelta, setShipAlexDelta] = useState(65);
  const [shipOther, setShipOther] = useState(85);

  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [socialFb, setSocialFb] = useState('');
  const [socialIg, setSocialIg] = useState('');
  const [socialWa, setSocialWa] = useState('');
  
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode);
      setShowAnnouncement(settings.announcement.show);
      setAnnouncementAr(settings.announcement.textAr);
      setAnnouncementEn(settings.announcement.textEn);
      setAnnouncementBg(settings.announcement.bgColor);
      setAnnouncementTextCol(settings.announcement.textColor);
      
      setShipCairoGiza(settings.shippingFees.cairoGiza);
      setShipAlexDelta(settings.shippingFees.alexDelta);
      setShipOther(settings.shippingFees.other);

      setContactPhone(settings.contactInfo.phone);
      setContactEmail(settings.contactInfo.email);
      setSocialFb(settings.contactInfo.facebook);
      setSocialIg(settings.contactInfo.instagram);
      setSocialWa(settings.contactInfo.whatsapp);
      setLogoUrl(settings.logoUrl);
    } else {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      maintenanceMode,
      announcement: {
        show: showAnnouncement,
        textAr: announcementAr,
        textEn: announcementEn,
        bgColor: announcementBg,
        textColor: announcementTextCol
      },
      shippingFees: {
        cairoGiza: shipCairoGiza,
        alexDelta: shipAlexDelta,
        other: shipOther
      },
      contactInfo: {
        phone: contactPhone,
        email: contactEmail,
        facebook: socialFb,
        instagram: socialIg,
        whatsapp: socialWa
      },
      logoUrl
    };

    const success = await updateSettings(payload);
    setIsSaving(false);
    
    if (success) {
      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Settings updated successfully!');
    } else {
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-neutral-900">
            {isRTL ? 'إعدادات المتجر العامة' : 'Store Settings Hub'}
          </h2>
          <p className="text-xs text-neutral-400">
            {isRTL ? 'تعديل الشحن، الإعلانات، التواصل، وحالة صيانة المتجر' : 'Adjust shipping rates, promotions, social media and storefront status'}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-sm cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? 'حفظ التعديلات' : 'Save Configurations'}
        </button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            {isRTL ? 'وضع الصيانة للمتجر' : 'Maintenance Settings'}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {isRTL 
              ? 'عند تفعيل وضع الصيانة، سيتم حظر تصفح المتجر وإظهار شاشة توضح ذلك للعملاء. الأدمن فقط يمكنه تخطي هذه الشاشة لإدارة الموقع.' 
              : 'Enabling maintenance mode blocks guest access, presenting customers with a structured maintenance message. Admins bypass this screen.'}
          </p>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <span className="text-xs font-bold text-neutral-700">
              {isRTL ? 'تفعيل وضع الصيانة للمتجر' : 'Activate Maintenance Mode'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>

        
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-neutral-700" />
            {isRTL ? 'أسعار شحن المحافظات' : 'Shipping Rates Manager'}
          </h3>
          <p className="text-xs text-neutral-400">
            {isRTL ? 'تعديل تكلفة التوصيل لكل إقليم ديناميكياً' : 'Set custom shipping prices for different territorial zones'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'القاهرة والجيزة (ج.م)' : 'Cairo & Giza (EGP)'}
              </label>
              <input 
                type="number"
                value={shipCairoGiza}
                onChange={(e) => setShipCairoGiza(Number(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'الإسكندرية ومحافظات الدلتا (ج.م)' : 'Alexandria & Delta (EGP)'}
              </label>
              <input 
                type="number"
                value={shipAlexDelta}
                onChange={(e) => setShipAlexDelta(Number(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'باقي المحافظات والصعيد (ج.م)' : 'Other Governorates (EGP)'}
              </label>
              <input 
                type="number"
                value={shipOther}
                onChange={(e) => setShipOther(Number(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                required
              />
            </div>
          </div>
        </div>

        
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-500" />
              {isRTL ? 'شريط الإعلانات التفاعلي' : 'Announcement Bar Configurator'}
            </h3>
            
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={showAnnouncement}
                onChange={(e) => setShowAnnouncement(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <p className="text-xs text-neutral-400">
            {isRTL ? 'إظهار أو إخفاء الشريط الترويجي وتعديل ألوانه ونصوصه التفاعلية' : 'Show promotions at the top of the viewport with customizable theme aesthetics.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'نص الإعلان (بالعربية)' : 'Announcement Text (Arabic)'}
              </label>
              <input 
                type="text"
                value={announcementAr}
                onChange={(e) => setAnnouncementAr(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black"
                placeholder="شحن مجاني..."
                required={showAnnouncement}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'نص الإعلان (بالإنجليزية)' : 'Announcement Text (English)'}
              </label>
              <input 
                type="text"
                value={announcementEn}
                onChange={(e) => setAnnouncementEn(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black"
                placeholder="Free shipping..."
                required={showAnnouncement}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'لون خلفية شريط الإعلانات' : 'Announcement Background Color'}
              </label>
              <div className="flex gap-3">
                <input 
                  type="color"
                  value={announcementBg}
                  onChange={(e) => setAnnouncementBg(e.target.value)}
                  className="w-12 h-11 p-1 bg-white border border-neutral-200 rounded-xl cursor-pointer"
                />
                <input 
                  type="text"
                  value={announcementBg}
                  onChange={(e) => setAnnouncementBg(e.target.value)}
                  className="flex-grow bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'لون نص الإعلان' : 'Announcement Text Color'}
              </label>
              <div className="flex gap-3">
                <input 
                  type="color"
                  value={announcementTextCol}
                  onChange={(e) => setAnnouncementTextCol(e.target.value)}
                  className="w-12 h-11 p-1 bg-white border border-neutral-200 rounded-xl cursor-pointer"
                />
                <input 
                  type="text"
                  value={announcementTextCol}
                  onChange={(e) => setAnnouncementTextCol(e.target.value)}
                  className="flex-grow bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            {isRTL ? 'معلومات التواصل' : 'Contact Support Info'}
          </h3>
          <p className="text-xs text-neutral-400">
            {isRTL ? 'تعديل البريد والهاتف للموقع وشاشة الصيانة' : 'These values are displayed on public footers and maintenance banners.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'رقم الهاتف' : 'Contact Phone'}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-100 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'البريد الإلكتروني' : 'Contact Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-100 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            {isRTL ? 'التواصل الاجتماعي وهوية المتجر' : 'Social Channels & Brand Logo'}
          </h3>
          <p className="text-xs text-neutral-400">
            {isRTL ? 'روابط حسابات السوشيال ميديا ورابط الشعار (اللوجو)' : 'Store logo image URL and redirection social links.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'رابط اللوجو (Logo URL)' : 'Logo Image URL'}
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-100 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'رابط صفحة فيسبوك' : 'Facebook Page Link'}
              </label>
              <input 
                type="url"
                value={socialFb}
                onChange={(e) => setSocialFb(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'رابط إنستجرام' : 'Instagram Profile Link'}
              </label>
              <input 
                type="url"
                value={socialIg}
                onChange={(e) => setSocialIg(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isRTL ? 'رابط واتساب' : 'WhatsApp Click-to-Chat Link'}
              </label>
              <input 
                type="url"
                value={socialWa}
                onChange={(e) => setSocialWa(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-black font-serif-en"
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </div>

      </div>

    </form>
  );
}
export default SettingsTab;
