import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

import { ProductImageGallery } from './components/ProductImageGallery';
import { ProductInfo } from './components/ProductInfo';
import { ProductReviews } from './components/ProductReviews';
import { RelatedProducts } from './components/RelatedProducts';

export function ProductDetailsView() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguageStore();
  const t = translations[language];

  
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

  const product = productData?.product;
  const reviews = reviewsData?.data || [];
  const averageRate = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rate, 0) / reviews.length).toFixed(1))
    : 0;

  const categoryIdStr = typeof product?.categoryID === 'object' && product?.categoryID
    ? (product.categoryID as any)._id
    : typeof product?.categoryID === 'string'
      ? product.categoryID
      : '';

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

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black transition-colors font-medium">
          <ArrowRight className={`w-3.5 h-3.5 ${language === 'en' ? 'rotate-180' : ''}`} />
          {t.backToShop}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
        <ProductImageGallery product={product} />
        <ProductInfo product={product} reviews={reviews} averageRate={averageRate} />
      </div>

      <ProductReviews productId={product._id} reviews={reviews} isLoadingReviews={isLoadingReviews} />
      
      <RelatedProducts categoryIdStr={categoryIdStr} productId={product._id} />
    </div>
  );
}
