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

  addToCart: async (productID: string, quantity: number): Promise<{ message: string; data: ICart }> => {
    const response = await api.post<{ message: string; data: ICart }>('/cart', { productID, quantity });
    return response.data;
  },

  removeFromCart: async (productID: string): Promise<{ message: string; data: ICart }> => {
    const response = await api.delete<{ message: string; data: ICart }>(`/cart/${productID}`);
    return response.data;
  },

  updateCartItemQuantity: async (productID: string, quantity: number): Promise<{ message: string; data: ICart }> => {
    const response = await api.put<{ message: string; data: ICart }>(`/cart/${productID}`, { quantity });
    return response.data;
  },

  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/cart/clear');
    return response.data;
  },
};
