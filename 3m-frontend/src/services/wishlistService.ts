import { api } from './api';

export const wishlistService = {
  async getWishlist() {
    const response = await api.get('/user/wishlist');
    return response.data;
  },

  async addToWishlist(productID: string) {
    const response = await api.post('/user/wishlist', { productID });
    return response.data;
  },

  async removeFromWishlist(productID: string) {
    const response = await api.delete(`/user/wishlist/${productID}`);
    return response.data;
  },
};
