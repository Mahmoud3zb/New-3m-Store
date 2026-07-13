import React, { useState } from 'react'
import { Heart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'
import { Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { Skeleton } from './ui/skeleton'

interface FeaturedProductProps {
  onAddToCart?: (product: { name: string; size: string; price: string }) => void
}

const mockFeaturedItem = (lang: 'ar' | 'en') => ({
  _id: 'featured-silk-dress',
  name: lang === 'ar' ? 'فستان السهرة الحريري' : 'Silk Evening Dress',
  description: lang === 'ar' 
    ? 'تصميم يلتف حول الجسم بنعومة فائقة. ياقة متدلية وقصة ظهر مفتوحة تمنحك إطلالة لا تُنسى في مناسباتك الخاصة.' 
    : 'Wrap-around body design with extreme softness. Draped neckline and open back give you an unforgettable look for your special occasions.',
  price: 450,
  imageCover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  categoryID: {
    _id: 'featured-category',
    name: lang === 'ar' ? 'الإصدار المحدود' : 'Limited Edition'
  }
} as any);

export const FeaturedProduct: React.FC<FeaturedProductProps> = () => {
  const [selectedSize, setSelectedSize] = useState<string>('S')
  const { addItem } = useCartStore()
  const wishlistItems = useWishlistStore((state) => state.items)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const { language } = useLanguageStore()
  const t = translations[language]

  
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['home-featured-product'],
    queryFn: () => productService.getProducts({ limit: 1 }),
  });

  const products = productsData?.data || [];
  const activeProduct = products.length > 0 ? products[0] : mockFeaturedItem(language);

  const isWishlisted = wishlistItems.some((item) => item._id === activeProduct._id)

  const sizes = [
    { label: 'XS', disabled: false },
    { label: 'S', disabled: false },
    { label: 'M', disabled: false },
    { label: 'L', disabled: true }, 
  ]

  const handleAddToCart = () => {
    addItem({
      ...activeProduct,
      selectedSize
    })
  }

  if (isLoading) {
    return (
      <div className="my-20 bg-white py-16 md:py-20 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-12 md:gap-16">
          <div className="w-full md:w-1/2">
            <Skeleton className="aspect-square md:aspect-[3/4] max-w-md mx-auto md:max-w-none rounded-2xl" />
          </div>
          <div className="w-full md:w-1/2 space-y-6 text-right" dir="rtl">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-7 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="pt-8 border-t border-gray-100 flex gap-4">
              <Skeleton className="flex-1 h-14 rounded-xl" />
              <Skeleton className="w-14 h-14 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = typeof activeProduct.categoryID === 'object' && activeProduct.categoryID
    ? (activeProduct.categoryID as any).name
    : t.featuredTitle;

  return (
    <section id="featured-product" className="my-20 bg-white py-16 md:py-20 border-y border-gray-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-12 md:gap-16">
        
        
        <div className="w-full md:w-1/2 relative hover-trigger">
          <Link to={`/product/${activeProduct._id}`} className="block overflow-hidden aspect-square rounded-full md:rounded-none md:aspect-[3/4] max-w-md mx-auto md:max-w-none border border-neutral-100/50 bg-[#F3F3F3] hover:opacity-95 transition-opacity">
            <img
              src={activeProduct.imageCover || '/p1.jpeg'}
              alt={activeProduct.name}
              className="w-full h-full object-cover img-reveal"
            />
          </Link>
        </div>

        
        <div className={`w-full md:w-1/2 max-w-md ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <span className="text-xs text-neutral-400 tracking-[0.2em] uppercase mb-4 block">
            {categoryName}
          </span>
          <Link to={`/product/${activeProduct._id}`} className="block hover:underline">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 leading-tight">
              {activeProduct.name}
            </h2>
          </Link>
          <p className="font-serif-en text-2xl mb-8 text-neutral-900 font-bold" dir="ltr">
            {activeProduct.price} {t.currency}
          </p>

          <p className="text-neutral-500 leading-relaxed mb-10 text-xs font-medium">
            {activeProduct.description}
          </p>

          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 text-sm font-bold">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-neutral-400 underline hover:text-[#111] transition-colors"
              >
                {t.sizeGuide}
              </a>
              <span className="text-black">{t.selectSize}</span>
            </div>
            <div className={`flex gap-3 text-sm font-serif-en ${language === 'ar' ? 'justify-end' : 'justify-start'}`} dir="ltr">
              {sizes.map((size) => {
                if (size.disabled) {
                  return (
                    <button
                      key={size.label}
                      disabled
                      className="w-12 h-12 border border-gray-200 text-gray-300 flex justify-center items-center cursor-not-allowed"
                    >
                      {size.label}
                    </button>
                  )
                }
                const isActive = selectedSize === size.label
                return (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size.label)}
                    className={`w-12 h-12 border flex justify-center items-center transition-colors cursor-pointer ${
                      isActive
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-black hover:border-black'
                    }`}
                  >
                    {size.label}
                  </button>
                )
              })}
            </div>
          </div>

          
          <div className="flex gap-4 border-t border-gray-200 pt-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-neutral-950 text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors cursor-pointer rounded-xl"
            >
              {t.addToCart}
            </button>
            <button
              onClick={() => toggleWishlist(activeProduct)}
              className={`w-14 h-14 border flex justify-center items-center transition-colors cursor-pointer rounded-xl ${
                isWishlisted
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-300 text-gray-500 hover:border-black'
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

