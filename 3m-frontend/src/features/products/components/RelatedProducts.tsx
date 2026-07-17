import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../services/productService';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

interface RelatedProductsProps {
  categoryIdStr: string;
  productId: string;
}

export function RelatedProducts({ categoryIdStr, productId }: RelatedProductsProps) {
  const { language } = useLanguageStore();
  const t = translations[language];

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
    .filter((p) => p._id !== productId)
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
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
              {((p.variants || []).reduce((sum: number, v: any) => sum + v.quantity, 0) === 0) && (
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
  );
}
