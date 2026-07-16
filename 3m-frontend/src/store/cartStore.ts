import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '../services/cartService';
import { api } from '../services/api';
import type { ICartItem, IProduct } from '../types';
import { useAuthStore } from './authStore';
import { toast } from 'react-hot-toast';

interface CartState {
  items: ICartItem[];
  totalCartPrice: number;
  isLoading: boolean;
  isCartOpen: boolean;
  promoCode: string | null;
  promoDiscountType: 'percentage' | 'fixed' | null;
  promoDiscountValue: number;
  discountAmount: number;

  fetchCart: () => Promise<void>;
  addItem: (product: IProduct, quantity?: number, size?: string, colorCode?: string) => Promise<void>;
  removeItem: (productID: string, size?: string, colorCode?: string) => Promise<void>;
  updateItemQuantity: (productID: string, quantity: number, size?: string, colorCode?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  applyPromo: (code: string) => Promise<void>;
  removePromo: () => void;
  recalculateDiscount: (total: number) => number;
  setCartData: (items: ICartItem[], totalCartPrice: number) => void;
}

export const getProductPrice = (product: IProduct): number => {
  if (product.offer && product.offer.discountedPrice !== undefined && product.offer.discountedPrice !== null) {
    const now = new Date();
    const start = new Date(product.offer.startDate);
    const end = new Date(product.offer.endDate);
    if (now >= start && now <= end) {
      return product.offer.discountedPrice;
    }
  }
  return product.price;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalCartPrice: 0,
      isLoading: false,
      isCartOpen: false,
      promoCode: null,
      promoDiscountType: null,
      promoDiscountValue: 0,
      discountAmount: 0,

      openCartDrawer: () => set({ isCartOpen: true }),
      closeCartDrawer: () => set({ isCartOpen: false }),
      toggleCartDrawer: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      recalculateDiscount: (total: number) => {
        const type = get().promoDiscountType;
        const val = get().promoDiscountValue;
        if (!type) return 0;
        if (type === 'percentage') {
          return Math.round(total * (val / 100));
        }
        return Math.min(total, val);
      },

      setCartData: (items: ICartItem[], totalCartPrice: number) => {
        const discount = get().recalculateDiscount(totalCartPrice);
        set({ items, totalCartPrice, discountAmount: discount });
      },

      applyPromo: async (code: string) => {
        const uppercaseCode = code.trim().toUpperCase();
        if (!uppercaseCode) return;
        try {
          const res = await api.post('/promo/validate', { code: uppercaseCode });
          const { discountType, discountValue } = res.data.data;
          
          set({
            promoCode: uppercaseCode,
            promoDiscountType: discountType,
            promoDiscountValue: discountValue
          });
          get().setCartData(get().items, get().totalCartPrice);
        } catch (err: any) {
          console.error(err);
          throw err;
        }
      },

      removePromo: () => {
        set({
          promoCode: null,
          promoDiscountType: null,
          promoDiscountValue: 0,
          discountAmount: 0
        });
      },

      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          const localItems = get().items;
          const total = localItems.reduce((acc, item) => acc + (getProductPrice(item.productID) * item.quantity), 0);
          get().setCartData(localItems, total);
          return;
        }

        set({ isLoading: true });
        try {
          const res = await cartService.getCart();
          get().setCartData(res.data?.items || [], res.totalCartPrice || 0);
        } catch (error) {
          console.error('Error fetching cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1, size, colorCode) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        let finalSize = size;
        let finalColorCode = colorCode;
        if ((!finalSize || !finalColorCode) && product.variants && product.variants.length > 0) {
          const availableVariant = product.variants.find((v: any) => v.quantity > 0) || product.variants[0];
          if (availableVariant) {
            finalSize = finalSize || availableVariant.size;
            finalColorCode = finalColorCode || availableVariant.colorCode;
          }
        }

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            await cartService.addToCart(product._id, quantity, finalSize, finalColorCode);
            const res = await cartService.getCart();
            get().setCartData(res.data?.items || [], res.totalCartPrice || 0);
            set({ isCartOpen: true });
            toast.success('تمت إضافة المنتج إلى السلة');
          } catch (error) {
            console.error('Error adding item to server cart:', error);
            toast.error('عذراً، فشل إضافة المنتج إلى السلة');
          } finally {
            set({ isLoading: false });
          }
        } else {
          const currentItems = [...get().items];
          const existingItemIndex = currentItems.findIndex(
            (item) => 
              item.productID._id === product._id && 
              item.size === finalSize && 
              item.colorCode === finalColorCode
          );

          if (existingItemIndex > -1) {
            currentItems[existingItemIndex].quantity += quantity;
          } else {
            currentItems.push({ productID: product, quantity, size: finalSize, colorCode: finalColorCode });
          }

          const total = currentItems.reduce((acc, item) => acc + (getProductPrice(item.productID) * item.quantity), 0);
          get().setCartData(currentItems, total);
          set({ isCartOpen: true });
          toast.success('تمت إضافة المنتج إلى السلة');
        }
      },

      removeItem: async (productID, size, colorCode) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            await cartService.removeFromCart(productID, size, colorCode);
            const res = await cartService.getCart();
            get().setCartData(res.data?.items || [], res.totalCartPrice || 0);
            toast.success('تمت إزالة المنتج من السلة');
          } catch (error) {
            console.error('Error removing item from server cart:', error);
            toast.error('عذراً، فشل إزالة المنتج من السلة');
          } finally {
            set({ isLoading: false });
          }
        } else {
          // Remove the specific variant from local state
          const filtered = get().items.filter(item => {
            const idMatch = item.productID._id === productID;
            const sizeMatch = size ? item.size === size : true;
            const colorMatch = colorCode ? item.colorCode === colorCode : true;
            return !(idMatch && sizeMatch && colorMatch);
          });
          const total = filtered.reduce((acc, item) => acc + (getProductPrice(item.productID) * item.quantity), 0);
          get().setCartData(filtered, total);
          toast.success('تمت إزالة المنتج من السلة');
        }
      },

      updateItemQuantity: async (productID, quantity, size, colorCode) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (quantity < 1) {
          await get().removeItem(productID, size, colorCode);
          return;
        }

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            await cartService.updateCartItemQuantity(productID, quantity, size, colorCode);
            const res = await cartService.getCart();
            get().setCartData(res.data?.items || [], res.totalCartPrice || 0);
          } catch (error) {
            console.error('Error updating item quantity on server cart:', error);
          } finally {
            set({ isLoading: false });
          }
        } else {
          const currentItems = [...get().items];
          // Target the specific variant in local state
          const existingItemIndex = currentItems.findIndex(item => {
            const idMatch = item.productID._id === productID;
            const sizeMatch = size ? item.size === size : true;
            const colorMatch = colorCode ? item.colorCode === colorCode : true;
            return idMatch && sizeMatch && colorMatch;
          });

          if (existingItemIndex > -1) {
            currentItems[existingItemIndex].quantity = quantity;
          }

          const total = currentItems.reduce((acc, item) => acc + (getProductPrice(item.productID) * item.quantity), 0);
          get().setCartData(currentItems, total);
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();

        
        get().removePromo();

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            await cartService.clearCart();
            get().setCartData([], 0);
            toast.success('تم تفريغ السلة بنجاح');
          } catch (error) {
            console.error('Error clearing server cart:', error);
            toast.error('عذراً، فشل تفريغ السلة');
          } finally {
            set({ isLoading: false });
          }
        } else {
          get().setCartData([], 0);
          toast.success('تم تفريغ السلة بنجاح');
        }
      },
    }),
    {
      name: 'azb-cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        totalCartPrice: state.totalCartPrice,
        promoCode: state.promoCode,
        promoDiscountType: state.promoDiscountType,
        promoDiscountValue: state.promoDiscountValue,
        discountAmount: state.discountAmount
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state) => {
    if (state.isAuthenticated) {
      useCartStore.getState().fetchCart();
    }
  });
}
