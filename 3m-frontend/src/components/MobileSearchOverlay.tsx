import React, { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'
import type { IProduct } from '../types'

interface MobileSearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { language } = useLanguageStore()
  const t = translations[language]

 
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery('')
      setSuggestions([])
    }
  }, [isOpen])

 
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await productService.getProducts({ keyword: searchQuery.trim(), limit: 6 })
        if (response && response.data) {
          setSuggestions(response.data)
        }
      } catch (err) {
        console.error('Error fetching mobile search suggestions:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  if (!isOpen) return null

  const handleSuggestionClick = (productId: string) => {
    onClose()
    navigate(`/product/${productId}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onClose()
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft

  return (
    <div 
      className="fixed inset-0 z-[150] bg-white flex flex-col"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
     
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <button 
          onClick={onClose}
          className="p-1 text-neutral-500 hover:text-black cursor-pointer"
          title="Back"
        >
          <BackIcon className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center bg-neutral-50 border border-neutral-200 focus-within:border-black rounded-full px-3 py-2 transition-all duration-300">
          <Search className="w-4 h-4 text-neutral-400 flex-shrink-0 mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-transparent border-none outline-none w-full placeholder-neutral-400 text-neutral-800 font-sans"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="p-0.5 text-neutral-400 hover:text-black cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

     
      <div className="flex-grow overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl" />
                <div className="flex-grow space-y-2">
                  <div className="h-3.5 bg-neutral-100 rounded w-2/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() === '' ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            {language === 'ar' ? 'ابدأ في كتابة اسم المنتج للبحث...' : 'Start typing a product name to search...'}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3.5">
            {suggestions.map((product) => (
              <button
                key={product._id}
                onClick={() => handleSuggestionClick(product._id)}
                className="w-full flex items-center gap-4 p-2 rounded-xl hover:bg-neutral-50 transition-colors text-left cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-100 flex-shrink-0">
                  <img 
                    src={product.imageCover || '/p1.jpeg'} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-bold text-neutral-800 truncate">
                    {product.name}
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-serif-en">
                    {product.price} {t.currency}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400 text-xs">
            {t.noSuggestionsFound}
          </div>
        )}
      </div>
    </div>
  )
}
