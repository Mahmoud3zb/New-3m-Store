import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { Heart, ShoppingBag, Star, ShieldCheck, ArrowRight, Trash2, Calendar, MessageSquare, Ruler, X } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';
import { QuickCheckoutModal } from '../../components/QuickCheckoutModal';

export function ProductDetailsView() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const { isAuthenticated, user, openAuthModal } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [activeImage, setActiveImage] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [isQuickCheckoutOpen, setIsQuickCheckoutOpen] = useState<boolean>(false);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => productService.getProductById(id || ''),
    enabled: !!id,
  });

  
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => reviewService.getProductReviews(id || ''),
    enabled: !!id,
  });

  
  
  const addReviewMutation = useMutation({
    mutationFn: (data: { rate: number; comment?: string }) =>
      reviewService.addReview(id || '', data.rate, data.comment),
    onSuccess: () => {
      setReviewSuccess(language === 'ar' ? 'تم إضافة تقييمك بنجاح! شكراً لك.' : 'Your review was successfully added! Thank you.');
      setComment('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || (language === 'ar' ? 'فشل إضافة التقييم. يرجى المحاولة لاحقاً.' : 'Failed to add review. Please try again later.');
      setReviewError(errMsg);
    },
  });

  
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
    },
  });

  const product = productData?.product;

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageCover);
    }
  }, [product]);

  const allImages = product
    ? [product.imageCover, ...(product.images || []).filter(img => img !== product.imageCover)].filter(Boolean)
    : [];

  
  const categoryIdStr = typeof product?.categoryID === 'object' && product?.categoryID
    ? (product.categoryID as any)._id
    : typeof product?.categoryID === 'string'
      ? product.categoryID
      : '';

  const { data: relatedProductsData } = useQuery({
    queryKey: ['related-products', categoryIdStr],
    queryFn: () => productService.getProducts({ categoryID: categoryIdStr, limit: 5 }),
    enabled: !!categoryIdStr,
  });

  const { data: generalProductsData } = useQuery({
    queryKey: ['general-products-fallback'],
    queryFn: () => productService.getProducts({ limit: 5 }),
    enabled: !categoryIdStr || !relatedProductsData?.data || relatedProductsData.data.length <= 1,
  });

  const relatedProductsRaw = relatedProductsData?.data || generalProductsData?.data || [];
  const relatedProducts = relatedProductsRaw
    .filter((p) => p._id !== id)
    .slice(0, 4);

  const reviews = reviewsData?.data || [];
  const averageRate = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rate, 0) / reviews.length).toFixed(1))
    : 0;

  const isWishlisted = product ? wishlistItems.some((item) => item._id === product._id) : false;

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsQuickCheckoutOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    addReviewMutation.mutate({ rate: rating, comment });
  };



  if (isLoadingProduct) {
    return (
      <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Skeleton className="aspect-[3/4] rounded-3xl" />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-28 pt-2" />
            <Skeleton className="h-20 w-full border-t border-neutral-100 pt-6" />
            <div className="flex gap-4 border-t border-neutral-100 pt-8">
              <Skeleton className="flex-1 h-14 rounded-xl" />
              <Skeleton className="w-14 h-14 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="pt-40 pb-20 text-center space-y-4">
        <p className="text-sm text-red-500 font-bold">{t.fetchDetailsError}</p>
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 border-b border-black pb-1 hover:text-neutral-500">
          <ArrowRight className={`w-4 h-4 ${language === 'en' ? 'rotate-180' : ''}`} />
          {t.backToStore}
        </Link>
      </div>
    );
  }

  const categoryName = typeof product.categoryID === 'object' && product.categoryID
    ? (product.categoryID as any).name
    : (language === 'ar' ? 'مجموعة غير محددة' : 'General Collection');

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
     
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black transition-colors font-medium">
          <ArrowRight className={`w-3.5 h-3.5 ${language === 'en' ? 'rotate-180' : ''}`} />
          {t.backToShop}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
        
       
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] bg-neutral-50 border border-neutral-100 rounded-3xl overflow-hidden shadow-sm relative group">
            <img
              src={activeImage || product.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" dir="ltr">
              {allImages.map((img, index) => {
                const isActive = activeImage === img;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 aspect-[3/4] bg-neutral-50 rounded-xl overflow-hidden border transition-all cursor-pointer flex-shrink-0 ${
                      isActive 
                        ? 'border-neutral-950 ring-2 ring-neutral-950/10 shadow-sm' 
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img src={img} alt={`${product.name} gallery ${index}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        
        <div className="lg:col-span-6 space-y-8">
          
          <div className="space-y-4">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">
              {categoryName}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
              {product.name}
            </h1>
            
            
            <div className={`flex items-center gap-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-neutral-500">({reviews.length} {t.reviewsCount})</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold text-neutral-900 mt-0.5">{averageRate || '0.0'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-2xl font-serif-en font-black text-neutral-950 pt-2" dir="ltr">
                {product.price} {t.currency}
              </div>
              
              {product.quantity === 0 ? (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-650 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-wider animate-pulse mt-2">
                  {t.outOfStock}
                </span>
              ) : product.quantity <= 5 ? (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-650 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-wider mt-2">
                  {t.onlyItemsLeft.replace('{count}', String(product.quantity))}
                </span>
              ) : null}
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-6">
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

      
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-800">{t.selectSize}</span>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-[11px] font-bold text-neutral-500 hover:text-black underline cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Ruler className="w-3.5 h-3.5" />
                {t.sizeGuide}
              </button>
            </div>
            <div className={`flex gap-2.5 font-serif-en text-xs ${language === 'ar' ? 'justify-end' : 'justify-start'}`} dir="ltr">
              {sizes.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={product.quantity === 0}
                    className={`w-11 h-11 border flex justify-center items-center rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                        : 'border-neutral-200 text-neutral-800 hover:border-black'
                    } ${product.quantity === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

       
          <div className="space-y-4 border-t border-neutral-100 pt-8">
            <button
              onClick={handleBuyNow}
              disabled={product.quantity === 0}
              className={`w-full text-xs font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                product.quantity === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-100'
                  : 'bg-black hover:bg-black text-white'
              }`}
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              {product.quantity === 0 ? t.outOfStock : (language === 'ar' ? 'شراء الآن (الدفع عند الاستلام)' : 'Buy Now (Cash on Delivery)')}
            </button>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className={`flex-1 text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  product.quantity === 0
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-100'
                    : 'bg-neutral-950 hover:bg-black text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {product.quantity === 0 ? t.outOfStock : t.addToShoppingBag}
              </button>
              
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-14 h-14 border flex justify-center items-center transition-all cursor-pointer rounded-xl ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-neutral-200 text-neutral-600 hover:border-black'
                }`}
                title={isWishlisted ? t.removeFromWishlist : t.addToWishlist}
              >
                <Heart
                  className="w-5 h-5"
                  fill={isWishlisted ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>

          <div className="bg-neutral-50/60 border border-neutral-100/80 rounded-2xl p-4 flex justify-between text-[11px] text-neutral-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t.original100}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>{t.return14Days}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              <span>{t.supportAlways}</span>
            </div>
          </div>

        </div>
      </div>

    
      <div className="border-t border-neutral-100 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
      
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-4">
            {t.reviewsTitle} ({reviews.length})
          </h3>

          {isLoadingReviews ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-20 rounded-2xl w-full" />
              <Skeleton className="h-20 rounded-2xl w-full" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-neutral-200/80 rounded-2xl">
              {t.noReviews}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => {
                const authorName = typeof rev.userID === 'object' && rev.userID 
                  ? (rev.userID as any).name 
                  : (language === 'ar' ? 'عميل 3M' : '3M Customer');
                const isAuthor = user && (typeof rev.userID === 'object' && rev.userID 
                  ? (rev.userID as any)._id === user._id 
                  : rev.userID === user._id);

                return (
                  <div key={rev._id} className="bg-neutral-50/30 border border-neutral-100/60 rounded-2xl p-5 space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block mb-1">{authorName}</span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(rev.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rate ? 'fill-current text-amber-500' : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      {rev.comment}
                    </p>

                    
                    {(isAuthor || user?.role === 'admin') && (
                      <button
                        onClick={() => deleteReviewMutation.mutate(rev._id)}
                        className={`absolute bottom-4 text-red-500 hover:text-red-700 transition-colors p-1.5 bg-white rounded-lg border border-neutral-100 shadow-sm cursor-pointer ${language === 'ar' ? 'left-4' : 'right-4'}`}
                        title={t.deleteReview}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

       
        <div className="lg:col-span-5 bg-neutral-50/50 border border-neutral-100/80 rounded-3xl p-6 md:p-8">
          <h3 className="text-base font-bold text-neutral-900 mb-6">{t.addReview}</h3>
          
          {!isAuthenticated ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-neutral-500">{t.loginToReview}</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 block">{t.ratingLabel}</label>
                <div className={`flex gap-1.5 text-neutral-200 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = 5 - i;
                    const isActive = rating >= starVal;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(starVal)}
                        className={`p-0.5 hover:scale-110 transition-transform cursor-pointer ${
                          isActive ? 'text-amber-500' : 'text-neutral-200'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

             
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 block">{t.commentLabel}</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.commentPlaceholder}
                  className={`w-full min-h-[100px] bg-white border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-800 focus:outline-none focus:border-black font-medium leading-relaxed resize-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                />
              </div>

              {reviewError && (
                <p className="text-[11px] text-red-500 font-bold bg-red-50 border border-red-100 p-3 rounded-xl">{reviewError}</p>
              )}
              {reviewSuccess && (
                <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-3 rounded-xl">{reviewSuccess}</p>
              )}

              <button
                type="submit"
                disabled={addReviewMutation.isPending}
                className="w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-400 text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
              >
                {addReviewMutation.isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>

            </form>
          )}
        </div>

      </div>

      
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowSizeGuide(false)} />
          <div 
            className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            
            <button 
              onClick={() => setShowSizeGuide(false)} 
              className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-400 hover:text-neutral-700`}
            >
              <X className="w-4.5 h-4.5" />
            </button>

            
            <div className="flex items-center gap-2 mb-6">
              <Ruler className="w-5 h-5 text-neutral-800" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">{t.sizeGuideTitle}</h3>
            </div>

           
            <div className="overflow-hidden border border-neutral-100 rounded-2xl mb-4">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-100">
                    <th className="py-2.5 px-3">{language === 'ar' ? 'المقاس' : 'Size'}</th>
                    <th className="py-2.5 px-3">{t.sizeGuideChest}</th>
                    <th className="py-2.5 px-3">{t.sizeGuideLength}</th>
                    <th className="py-2.5 px-3">{t.sizeGuideShoulders}</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {[
                    { name: 'XS', chest: '46', length: '66', shoulders: '40' },
                    { name: 'S', chest: '48', length: '68', shoulders: '42' },
                    { name: 'M', chest: '50', length: '70', shoulders: '44' },
                    { name: 'L', chest: '52', length: '72', shoulders: '46' },
                    { name: 'XL', chest: '54', length: '74', shoulders: '48' }
                  ].map((row) => {
                    const isSelected = selectedSize === row.name;
                    return (
                      <tr 
                        key={row.name}
                        className={`transition-colors duration-200 border-b border-neutral-100/70 last:border-b-0 ${
                          isSelected 
                            ? 'bg-neutral-950 text-white font-bold' 
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold">{row.name}</td>
                        <td className="py-3 px-3 font-mono">{row.chest}</td>
                        <td className="py-3 px-3 font-mono">{row.length}</td>
                        <td className="py-3 px-3 font-mono">{row.shoulders}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            
            <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
              {t.sizeGuideNote}
            </p>
          </div>
        </div>
      )}

      
      {relatedProducts.length > 0 && (
        <div className="border-t border-neutral-100 pt-16 mt-16 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-serif-en uppercase tracking-widest text-neutral-900 font-bold">
                {t.youMayAlsoLike}
              </h3>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1">
                {language === 'ar' ? 'تشكيلة مختارة بعناية لتكمل مظهرك' : 'Curated pieces to complete your look'}
              </p>
            </div>
            <Link 
              to="/shop" 
              className="text-xs font-bold text-neutral-900 hover:text-neutral-500 border-b border-black pb-0.5 transition-colors"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link 
                key={p._id}
                to={`/product/${p._id}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group space-y-3"
              >
                <div className="aspect-[3/4] bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100/70 shadow-sm relative">
                  <img 
                    src={p.imageCover || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} 
                    alt={p.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.quantity === 0 && (
                    <span className="absolute top-2.5 right-2.5 bg-red-50 text-red-650 text-[8px] font-extrabold px-2 py-0.5 rounded-full border border-red-100">
                      {t.outOfStock}
                    </span>
                  )}
                </div>
                <div className={`space-y-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h4 className="text-xs font-bold text-neutral-850 group-hover:text-black line-clamp-1 transition-colors">
                    {p.name}
                  </h4>
                  <span className="text-[11px] font-serif-en font-bold text-neutral-900 block" dir="ltr">
                    {p.price} {t.currency}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <QuickCheckoutModal
        isOpen={isQuickCheckoutOpen}
        onClose={() => setIsQuickCheckoutOpen(false)}
        product={product}
        selectedSize={selectedSize}
      />
    </div>
  );
}
