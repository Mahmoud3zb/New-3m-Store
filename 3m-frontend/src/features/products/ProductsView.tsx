import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { Heart, ShoppingBag, SlidersHorizontal, X, Search } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

export function ProductsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('categoryID') || '';
  const sortBy = searchParams.get('sort') || '-createdAt';
  const { addItem } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(keyword);
  const { language } = useLanguageStore();
  const t = translations[language];

  
  useEffect(() => {
    setSearchTerm(keyword);
  }, [keyword]);


  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      const currentKeyword = newParams.get('keyword') || '';
      
      if (searchTerm.trim() !== currentKeyword) {
        if (searchTerm.trim()) {
          newParams.set('keyword', searchTerm.trim());
        } else {
          newParams.delete('keyword');
        }
        setSearchParams(newParams);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['products', keyword, selectedCategory, sortBy],
    queryFn: () => productService.getProducts({
      keyword: keyword || undefined,
      categoryID: selectedCategory || undefined,
      sort: sortBy || undefined,
      limit: 50,
    }),
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const handleCategorySelect = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newParams.set('categoryID', categoryId);
    } else {
      newParams.delete('categoryID');
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('keyword');
    setSearchParams(newParams);
  };

  const handleSortChange = (sortVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortVal && sortVal !== '-createdAt') {
      newParams.set('sort', sortVal);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };



  const handleAddToCart = (product: any) => {
    addItem(product);
  };

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-[80vh] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
     
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-serif-en uppercase tracking-widest mb-3 text-neutral-900">
          {t.exclusiveCollections}
        </h1>
        <p className="text-xs md:text-sm text-neutral-400 uppercase tracking-widest font-sans font-medium">
          {t.editorialCuration}
        </p>
      </div>

      
      <div className="mb-10 max-w-md mx-auto">
        <form 
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center bg-white border border-neutral-100 hover:border-neutral-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 rounded-2xl px-4 py-3 transition-all duration-300 shadow-sm"
        >
          <Search className={`w-4 h-4 text-neutral-400 flex-shrink-0 ${language === 'ar' ? 'ml-2.5' : 'mr-2.5'}`} />
          <input
            type="text"
            name="search"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`text-xs bg-transparent border-none outline-none w-full placeholder-neutral-400 text-neutral-800 font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className={`sticky top-28 space-y-8 pr-8 pl-8 ${language === 'ar' ? 'border-l border-neutral-100 pr-0' : 'border-r border-neutral-100 pl-0'}`}>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-5 border-b border-neutral-100 pb-3">
                {t.categories}
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`text-xs uppercase tracking-wider transition-colors cursor-pointer block w-full ${language === 'ar' ? 'text-right' : 'text-left'} ${
                      !selectedCategory 
                        ? `text-black font-extrabold ${language === 'ar' ? 'border-r-2 border-black pr-2' : 'border-l-2 border-black pl-2'}` 
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    {t.allProducts}
                  </button>
                </li>
                {isLoadingCategories ? (
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ) : (
                  categories.map((cat) => (
                    <li key={cat._id}>
                      <button
                        onClick={() => handleCategorySelect(cat._id)}
                        className={`text-xs uppercase tracking-wider transition-colors cursor-pointer block w-full ${language === 'ar' ? 'text-right' : 'text-left'} ${
                          selectedCategory === cat._id 
                            ? `text-black font-extrabold ${language === 'ar' ? 'border-r-2 border-black pr-2' : 'border-l-2 border-black pl-2'}` 
                            : 'text-neutral-500 hover:text-black'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-3">
                {t.extraFilters}
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
                {t.filterDesc}
              </p>
            </div>
          </div>
        </aside>

       
        <div className="lg:hidden flex items-center justify-between border-b border-neutral-100 pb-4 w-full">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 border border-neutral-200 px-4 py-2 rounded-full cursor-pointer hover:bg-neutral-50 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t.filterCollections}
          </button>
          
          {selectedCategory && (
            <span className="text-xs text-neutral-500 font-medium">
              {t.selectedCategory} {categories.find(c => c._id === selectedCategory)?.name || '...'}
            </span>
          )}
        </div>

       
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className={`absolute top-0 h-full w-72 bg-white p-6 shadow-2xl flex flex-col z-10 ${language === 'ar' ? 'right-0 text-right animate-slide-in-right' : 'left-0 text-left animate-slide-in-left'}`}>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">{t.categories}</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-neutral-100 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-4">
                <li>
                  <button
                    onClick={() => { handleCategorySelect(''); setMobileFiltersOpen(false); }}
                    className={`text-xs uppercase tracking-wider block w-full ${language === 'ar' ? 'text-right pr-2 border-r-2 border-black' : 'text-left pl-2 border-l-2 border-black'} ${
                      !selectedCategory ? 'text-black font-extrabold pr-2' : 'text-neutral-500'
                    }`}
                  >
                    {t.allProducts}
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <button
                      onClick={() => { handleCategorySelect(cat._id); setMobileFiltersOpen(false); }}
                      className={`text-xs uppercase tracking-wider block w-full ${language === 'ar' ? 'text-right pr-2 border-r-2 border-black' : 'text-left pl-2 border-l-2 border-black'} ${
                        selectedCategory === cat._id ? 'text-black font-extrabold pr-2' : 'text-neutral-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

       
        <div className="flex-grow">
          {/* Header Row: Total Products Count & Sorting Dropdown */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-4">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              {products.length} {language === 'ar' ? 'منتج متاح' : 'products available'}
            </span>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{t.sortLabel}:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className={`text-xs bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-black font-semibold text-neutral-800 transition-all cursor-pointer ${
                  language === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                <option value="-createdAt">{t.sortByNewest}</option>
                <option value="price">{t.sortByPriceAsc}</option>
                <option value="-price">{t.sortByPriceDesc}</option>
              </select>
            </div>
          </div>
          {keyword && (
            <div className="mb-6 flex items-center justify-between bg-neutral-50 border border-neutral-200/60 rounded-2xl px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">{t.searchResults}</span>
                <span className="font-bold text-black font-mono">"{keyword}"</span>
              </div>
              <button
                onClick={handleClearSearch}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
              >
                {t.clearSearch}
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((id) => (
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
          ) : productsError ? (
            <div className="py-20 text-center space-y-4">
              <p className="text-sm text-red-500 font-bold">{t.fetchProductsError}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-neutral-200 rounded-3xl space-y-3">
              <SlidersHorizontal className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">{t.noProductsFound}</p>
              <p className="text-xs text-neutral-400">{t.noProductsDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {products.map((product) => {
                const categoryName = typeof product.categoryID === 'object' && product.categoryID 
                  ? (product.categoryID as any).name 
                  : (language === 'ar' ? 'مجموعة غير محددة' : 'General Collection');

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
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                          }}
                          className={`absolute top-3 right-3 bg-white/95 backdrop-blur-md hover:bg-white w-8 h-8 rounded-full transition-all shadow-sm flex items-center justify-center cursor-pointer z-10 ${
                            wishlistItems.some((item) => item._id === product._id)
                              ? 'text-red-500'
                              : 'text-neutral-800 hover:text-red-500'
                          }`}
                          title={wishlistItems.some((item) => item._id === product._id) ? t.removeFromWishlist : t.addToWishlist}
                        >
                          <Heart 
                            className="w-3.5 h-3.5" 
                            fill={wishlistItems.some((item) => item._id === product._id) ? 'currentColor' : 'none'}
                          />
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
                        <span className="text-xs font-bold text-neutral-900 font-serif-en" dir="ltr">
                          {product.price} {t.currency}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {t.addToCart}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
        
  );

}
