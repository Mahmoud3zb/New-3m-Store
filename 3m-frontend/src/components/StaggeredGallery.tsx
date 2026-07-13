import React from 'react'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

interface GalleryItem {
  id: string
  title: string
  subtitle: string
  price: string
  image: string
  aspectRatio: string
}

interface StaggeredGalleryProps {
  onItemClick?: (itemId: string) => void
}

export const StaggeredGallery: React.FC<StaggeredGalleryProps> = ({
  onItemClick,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const items: GalleryItem[] = [
    {
      id: 'اوت فيت',
      title: t.galleryItem1Title,
      subtitle: t.galleryItem1Sub,
      price: `1750 ${t.currency}`,
      image: '/p5.jpeg',
      aspectRatio: 'aspect-[4/5]',
    },
    {
      id: 'اوت فيت',
      title: t.galleryItem2Title,
      subtitle: t.galleryItem2Sub,
      price: `2000 ${t.currency}`,
      image: '/p6.jpeg',
      aspectRatio: 'aspect-[3/4]',
    },
  ]

  return (
    <section className="py-20 md:py-32 px-6 md:px-10 max-w-7xl mx-auto">
    
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-4 md:gap-0 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        <h2 className="text-3xl md:text-4xl font-bold leading-tight text-black">
          {language === 'ar' ? (
            <>لغة بصرية <br className="hidden md:block" /> جديدة.</>
          ) : (
            <>A new visual <br className="hidden md:block" /> language.</>
          )}
        </h2>
        <p className={`text-gray-500 max-w-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {t.gallerySubtitle}
        </p>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-10 items-start">
       
        <div
          onClick={() => onItemClick?.(items[0].id)}
          className="md:col-span-7 relative group cursor-pointer hover-trigger pb-8 md:pb-12"
        >
          <div className={`overflow-hidden ${items[0].aspectRatio} bg-gray-100`}>
            <img
              src={items[0].image}
              alt={items[0].title}
              className="w-full h-full object-cover img-reveal grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          
          
          <div className={`absolute bottom-0 bg-white p-5 md:p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 w-56 md:w-64 z-20 border border-neutral-100/50 ${language === 'ar' ? 'right-4 md:-bottom-8 md:-right-6 text-right' : 'left-4 md:-bottom-8 md:-left-6 text-left'}`}>
            <span className="text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-1">
              {items[0].subtitle}
            </span>
            <h3 className="font-bold text-xs md:text-sm mb-3 leading-tight text-neutral-900">
              {items[0].title}
            </h3>
            <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
              <span className="font-serif-en text-xs md:text-sm font-bold text-neutral-800" dir="ltr">
                {items[0].price}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-black group-hover:text-neutral-500 transition-colors">
                {t.shopNow}
              </span>
            </div>
          </div>
        </div>

       
        <div
          onClick={() => onItemClick?.(items[1].id)}
          className="md:col-span-5 md:mt-40 relative group cursor-pointer hover-trigger pb-8 md:pb-12"
        >
          <div className={`overflow-hidden ${items[1].aspectRatio} bg-gray-100`}>
            <img
              src={items[1].image}
              alt={items[1].title}
              className="w-full h-full object-cover img-reveal grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          
          
          <div className={`absolute bottom-0 bg-white p-5 md:p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 w-56 md:w-64 z-20 border border-neutral-100/50 ${language === 'ar' ? 'left-4 md:-bottom-8 md:-left-6 text-right' : 'right-4 md:-bottom-8 md:-right-6 text-left'}`}>
            <span className="text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-1">
              {items[1].subtitle}
            </span>
            <h3 className="font-bold text-xs md:text-sm mb-3 leading-tight text-neutral-900">
              {items[1].title}
            </h3>
            <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
              <span className="font-serif-en text-xs md:text-sm font-bold text-neutral-800" dir="ltr">
                {items[1].price}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-black group-hover:text-neutral-500 transition-colors">
                {t.shopNow}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
