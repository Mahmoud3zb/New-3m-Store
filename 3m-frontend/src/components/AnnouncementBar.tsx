import { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useLanguageStore } from '../store/languageStore';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const { settings } = useSettingsStore();
  const { language } = useLanguageStore();
  
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('3m_announcement_dismissed') !== 'true';
    }
    return true;
  });

  if (!settings || !settings.announcement.show || !isOpen) {
    return null;
  }

  const { textAr, textEn, bgColor, textColor } = settings.announcement;
  const displayText = language === 'ar' ? textAr : textEn;

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('3m_announcement_dismissed', 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('announcement:toggle'));
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 w-full overflow-hidden text-center py-2 px-8 text-xs font-bold transition-all duration-300 z-50 flex items-center justify-center min-h-[36px] h-9"
      style={{ 
        backgroundColor: bgColor || '#000000', 
        color: textColor || '#ffffff' 
      }}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center animate-pulse duration-2000">
        <span className="tracking-wide text-[11px] md:text-xs">
          {displayText}
        </span>
      </div>

      <button 
        onClick={handleClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity p-0.5 rounded-full cursor-pointer"
        aria-label="Close announcement"
        style={{ color: textColor }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
export default AnnouncementBar;
