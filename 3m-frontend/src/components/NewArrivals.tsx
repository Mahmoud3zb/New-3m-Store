import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { Heart, ShoppingBag } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

export const NewArrivals: React.FC = () => {
  const { addItem } = useCartStore()
  const wishlistItems = useWishlistStore((state) => state.items)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const { language } = useLanguageStore()
  const t = translations[language]

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productService.getProducts({ limit: 4, sort: '-createdAt' }),
  })

  const products = productsData?.data || []

  if (isLoading) {
    return (
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-48 mb-8 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="space-y-4 p-3 border border-neutral-100/40 rounded-3xl">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-28" />
              <div className="pt-2 border-t border-neutral-50 flex justify-between items-center">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className={`py-16 px-6 md:px-12 max-w-7xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b border-neutral-100 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif-en uppercase tracking-widest text-neutral-900 mb-2">
            {t.newArrivalsTitle}
          </h2>
          <p className="text-[11px] text-neutral-400 font-sans tracking-wider">
            {t.newArrivalsSubtitle}
          </p>
        </div>
        <Link 
          to="/shop" 
          className="text-xs font-bold uppercase tracking-wider text-black hover:opacity-70 transition-opacity mt-4 md:mt-0 flex items-center gap-1.5 cursor-pointer underline"
        >
          {t.viewAllCollections}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => {
          const isWishlisted = wishlistItems.some((item) => item._id === product._id)
          const categoryName = typeof product.categoryID === 'object' && product.categoryID 
            ? (product.categoryID as any).name 
            : (language === 'ar' ? 'مجموعة جديدة' : 'New Collection');

          return (
            <div key={product._id} className="group relative flex flex-col justify-between bg-white p-3 rounded-3xl border border-neutral-100/40 hover:shadow-md transition-all duration-300">
              <div>
                <div className="aspect-[3/4] bg-[#F3F3F3] overflow-hidden relative mb-4 rounded-2xl border border-neutral-100/50">
                  <Link to={`/product/${product._id}`} className="block w-full h-full">
                    <img
                      src={product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-3 right-3 bg-white/95 backdrop-blur-md hover:bg-white w-8 h-8 rounded-full transition-all shadow-sm flex items-center justify-center cursor-pointer z-10 ${
                      isWishlisted ? 'text-red-500' : 'text-neutral-800 hover:text-red-500'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1 block">
                  {categoryName}
                </span>
                <Link to={`/product/${product._id}`} className="block hover:underline mb-1">
                  <h3 className="text-[13px] font-bold text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                  {product.description}
                </p>
              </div>

              <div className="mt-auto pt-2 border-t border-neutral-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-neutral-400">{t.priceLabel}</span>
                  <div className="flex items-center gap-1.5">
                    {product.offer && product.offer.discountedPrice !== undefined && (
                      (() => {
                        const now = new Date();
                        const start = new Date(product.offer.startDate);
                        const end = new Date(product.offer.endDate);
                        if (now >= start && now <= end) {
                          return (
                            <>
                              <span className="text-[10px] line-through text-red-500 font-serif-en opacity-70" dir="ltr">
                                {product.price} {t.currency}
                              </span>
                              <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                                {product.offer.discountedPrice} {t.currency}
                              </span>
                            </>
                          );
                        }
                        return null;
                      })()
                    ) || (
                      <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                        {product.price} {t.currency}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addItem(product)}
                  className="w-full bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-3 h-3" />
                  {t.addToCart}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
