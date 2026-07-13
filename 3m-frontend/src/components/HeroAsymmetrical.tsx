import React from 'react'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

interface HeroAsymmetricalProps {
  onShopClick?: () => void
  onExploreFeatured?: () => void
}

export const HeroAsymmetrical: React.FC<HeroAsymmetricalProps> = ({
  onShopClick,
  onExploreFeatured,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 md:py-20 overflow-hidden">
      
      <h1
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-serif-en font-bold text-black/[0.03] whitespace-nowrap z-0 select-none pointer-events-none hidden md:block"
        dir="ltr"
      >
        ELEVATE.
      </h1>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
        
        
        <div className="relative w-full max-w-md md:w-[450px] h-[500px] md:h-[650px] shadow-2xl hover-trigger">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/p7.jpeg"
              alt="Hero Fashion"
              className="w-full h-full object-cover img-reveal"
            />
          </div>

     
          <div className={`absolute -bottom-10 bg-white p-8 shadow-xl w-72 z-20 hidden md:block ${language === 'ar' ? '-right-10 text-right' : '-left-10 text-left'}`}>
            <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase block mb-2">
              {t.pieceOfTheSeason}
            </span>
            <h3 className="font-bold text-xl mb-4 leading-tight">
              {t.youthfulOutfit}
            </h3>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <span className="font-serif-en text-base font-extrabold text-neutral-900" dir="ltr">
                1750 {t.currency}
              </span>
              <button
                onClick={onExploreFeatured}
                className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors cursor-pointer"
              >
                {t.explore}
              </button>
            </div>
          </div>
        </div>

       
        {/* <div className="md:hidden bg-white p-6 shadow-xl w-full">
          <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase block mb-1">
            قطعة الموسم
          </span>
          <h3 className="font-bold text-lg mb-2">معطف من الصوف الفاخر</h3>
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <span className="font-serif-en text-base" dir="ltr">
              $320
            </span>
            <button
              onClick={onExploreFeatured}
              className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors cursor-pointer"
            >
              استكشف
            </button>
          </div>
        </div> */}

       
        <div className={`w-full md:w-1/3 md:ml-10 z-10 md:mt-[-50px] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-[1.2] md:leading-[1.1] text-black">
            {t.heroTitleLine1}
            <br />
            {t.heroTitleLine2}
            <br />
            {t.heroTitleLine3}
          </h2>
          <p className="text-gray-500 mb-8 md:mb-10 leading-relaxed text-base md:text-lg">
            {t.heroSubtitle}
          </p>
          <button
            onClick={onShopClick}
            className="w-full md:w-auto bg-[#111] text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {t.shopCollection}
          </button>
        </div>
      </div>
    </section>
  )
}
