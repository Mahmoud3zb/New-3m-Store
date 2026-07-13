import React from 'react'
import { Truck, ShieldCheck, HeartHandshake, Package } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

export const BrandValues: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const values = [
    {
      Icon: Truck,
      title: t.value1Title,
      description: t.value1Desc,
    },
    {
      Icon: ShieldCheck,
      title: t.value2Title,
      description: t.value2Desc,
    },
    {
      Icon: Package,
      title: t.value3Title,
      description: t.value3Desc,
    },
    {
      Icon: HeartHandshake,
      title: t.value4Title,
      description: t.value4Desc,
    },
  ]

  return (
    <section className="bg-neutral-900 text-white py-20 px-6 md:px-12 border-y border-neutral-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-xl mx-auto space-y-4">
          <h2 className="text-xl md:text-2xl font-serif-en uppercase tracking-widest text-white">
            {t.brandValuesTitle}
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans font-medium">
            {t.brandValuesSubtitle}
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {values.map(({ Icon, title, description }, index) => (
            <div 
              key={index} 
              className="group bg-neutral-950 border border-neutral-800/80 p-8 rounded-3xl hover:border-white/20 hover:bg-black transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 bg-white/5 group-hover:bg-white group-hover:text-black text-white rounded-2xl flex items-center justify-center transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold tracking-wide text-white">{title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
