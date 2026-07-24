import React, { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/productService'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

export const WhatsAppWidget: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false)
  const { user } = useAuthStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const location = useLocation()

  
  const match = location.pathname.match(/^\/product\/([a-fA-F0-9]{24})$/)
  const productId = match ? match[1] : null

  
  const { data: productData } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => productService.getProductById(productId || ''),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, 
  })

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [location.pathname]) 

  
  const phoneNumber = '201006488707' 
  const currentUrl = window.location.href
  
  let greeting = ''
  if (user?.name) {
    const firstName = user.name.split(' ')[0]
    greeting = language === 'ar' 
      ? `أنا العميل ${firstName}. ` 
      : `I am customer ${firstName}. `
  }

  let text = ''
  if (productId && productData?.product) {
    const productName = productData.product.name
    text = `${greeting}${t.whatsappInquiry}${productName}\n🔗 ${currentUrl}`
  } else {
    text = `${greeting}${t.whatsappGeneral}\n🔗 ${currentUrl}`
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`

  return (
    <div 
      className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-40 flex items-center gap-3 pointer-events-none select-none"
      dir="ltr"
    >
      
      {showTooltip && (
        <div 
          className="relative bg-white text-neutral-800 text-[11px] font-bold px-3.5 py-2.5 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-neutral-100 flex items-center gap-2 max-w-[200px] md:max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <span>{t.whatsappTooltip}</span>
          <button 
            onClick={() => setShowTooltip(false)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5 rounded-full cursor-pointer ml-1"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
          
          <div className="absolute bottom-1/2 translate-y-1/2 w-2.5 h-2.5 bg-white border-b border-r border-neutral-100 rotate-[45deg] -right-1.5" />
        </div>
      )}

      
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-[#25D366] hover:bg-[#20BA5A] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 pointer-events-auto group cursor-pointer"
        title="WhatsApp Support"
      >
        <MessageCircle className="w-7 h-7 fill-current group-hover:rotate-6 transition-transform duration-300" />
        
        
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10" />
      </a>
    </div>
  )
}
