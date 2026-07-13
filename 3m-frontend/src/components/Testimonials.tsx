import React from 'react'
import { Star, Quote } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

export const Testimonials: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const reviews = [
    {
      name: t.review1Name,
      text: t.review1Text,
      rating: 5,
      date: t.review1Date,
    },
    {
      name: t.review2Name,
      text: t.review2Text,
      rating: 5,
      date: t.review2Date,
    },
    {
      name: t.review3Name,
      text: t.review3Text,
      rating: 5,
      date: t.review3Date,
    },
  ]

  return (
    <section className={`py-20 px-6 md:px-12 max-w-7xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-xl md:text-2xl font-serif-en uppercase tracking-widest text-neutral-900">
          {t.testimonialsTitle}
        </h2>
        <p className="text-xs text-neutral-400 tracking-wider">
          {t.testimonialsSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((rev, idx) => (
          <div 
            key={idx} 
            className="bg-white border border-neutral-100/80 p-8 rounded-3xl relative hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className={`absolute top-6 text-neutral-100 pointer-events-none ${language === 'ar' ? 'left-6' : 'right-6'}`}>
              <Quote className="w-12 h-12 rotate-180" />
            </div>
            
            <div>
              <div className="flex gap-1 mb-6 justify-start text-amber-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium mb-8">
                "{rev.text}"
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-50 text-[10px] text-neutral-400">
              <span className="font-bold text-neutral-800 text-xs">{rev.name}</span>
              <span>{rev.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
