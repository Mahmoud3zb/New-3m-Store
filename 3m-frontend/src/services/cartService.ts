import { api } from './api';
import type { ICart } from '../types';

export interface CartResponse {
  message: string;
  totalCartPrice: number;
  data: ICart;
}

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>('/cart');
    return response.data;
  },

  addToCart: async (productID: string, quantity: number, size?: string, colorCode?: string): Promise<{ message: string; data: ICart }> => {
    const response = await api.post<{ message: string; data: ICart }>('/cart', { productID, quantity, size, colorCode });
    return response.data;
  },

  // Pass size & colorCode as query params to target the correct variant
  removeFromCart: async (productID: string, size?: string, colorCode?: string): Promise<{ message: string; data: ICart }> => {
    const params = new URLSearchParams();
    if (size) params.append('size', size);
    if (colorCode) params.append('colorCode', colorCode);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.delete<{ message: string; data: ICart }>(`/cart/${productID}${query}`);
    return response.data;
  },

  // Pass size & colorCode in body to target the correct variant
  updateCartItemQuantity: async (productID: string, quantity: number, size?: string, colorCode?: string): Promise<{ message: string; data: ICart }> => {
    const response = await api.put<{ message: string; data: ICart }>(`/cart/${productID}`, { quantity, size, colorCode });
    return response.data;
  },

  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/cart/clear');
    return response.data;
  },
};

