import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService } from '../services/wishlistService';
import type { IProduct } from '../types';
import { useAuthStore } from './authStore';
import { toast } from 'react-hot-toast';

interface WishlistState {
  items: IProduct[];
  isLoading: boolean;
  
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: IProduct) => Promise<void>;
  isInWishlist: (productID: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          return;
        }

        set({ isLoading: true });
        try {
          const res = await wishlistService.getWishlist();
          set({ items: res.data || [] });
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (product) => {
        const { isAuthenticated } = useAuthStore.getState();
        const currentItems = get().items;
        const exists = currentItems.some((item) => item._id === product._id);

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            if (exists) {
              await wishlistService.removeFromWishlist(product._id);
              set({ items: currentItems.filter((item) => item._id !== product._id) });
              toast.success('تمت إزالة المنتج من المفضلة');
            } else {
              await wishlistService.addToWishlist(product._id);
              set({ items: [...currentItems, product] });
              toast.success('تمت إضافة المنتج إلى المفضلة');
            }
          } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('عذراً، فشل تحديث المفضلة');
          } finally {
            set({ isLoading: false });
          }
        } else {
          if (exists) {
            set({ items: currentItems.filter((item) => item._id !== product._id) });
            toast.success('تمت إزالة المنتج من المفضلة');
          } else {
            set({ items: [...currentItems, product] });
            toast.success('تمت إضافة المنتج إلى المفضلة');
          }
        }
      },

      isInWishlist: (productID) => {
        return get().items.some((item) => item._id === productID);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
