import React from 'react'
import { Home, Shirt, Search, Heart, User } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

export type TabType = 'home' | 'shop' | 'search' | 'favorites' | 'profile'

interface MobileNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  favoritesCount?: number
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
}) => {
  const { language } = useLanguageStore()
  const t = translations[language]

  const tabs = [
    { id: 'home' as TabType, label: t.home, Icon: Home },
    { id: 'shop' as TabType, label: t.shop, Icon: Shirt },
    { id: 'search' as TabType, label: t.search, Icon: Search, isFloating: true },
    { id: 'favorites' as TabType, label: t.favorites, Icon: Heart, badge: favoritesCount },
    { id: 'profile' as TabType, label: t.profile, Icon: User },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden pointer-events-none">
      <div className="flex justify-around items-center bg-white/70 backdrop-blur-xl border border-white/30 py-3 px-6 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] pointer-events-auto">
        {tabs.map(({ id, Icon, badge, isFloating }) => {
          const isActive = activeTab === id
          if (isFloating) {
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="relative -top-5 bg-black hover:bg-neutral-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-[#F8F8F8] transition-transform active:scale-95 cursor-pointer flex-shrink-0"
                title={t.search}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          }
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="relative p-2 flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <Icon
                className={`w-6 h-6 transition-colors duration-300 ${
                  isActive ? 'text-black scale-110' : 'text-gray-400 hover:text-gray-600'
                }`}
              />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-serif-en">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
