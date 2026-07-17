import { useState, useEffect } from 'react';

interface ProductImageGalleryProps {
  product: {
    name: string;
    imageCover: string;
    images?: string[];
  };
}

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageCover);
    }
  }, [product]);

  const allImages = product
    ? [product.imageCover, ...(product.images || []).filter(img => img !== product.imageCover)].filter(Boolean)
    : [];

  return (
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
  );
}
