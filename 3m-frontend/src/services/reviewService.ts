import { api } from './api';
import type { IReview } from '../types';

export interface ReviewsResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  data: IReview[];
}

export const reviewService = {
  getProductReviews: async (productID: string, page = 1, limit = 10): Promise<ReviewsResponse> => {
    try {
      const response = await api.get<ReviewsResponse>(`/review/${productID}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (err) {
      console.warn('API /review failed, falling back to empty reviews:', err);
      return {
        message: 'Mock fallback reviews response',
        page,
        limit,
        total: 0,
        data: []
      };
    }
  },

  addReview: async (productID: string, rate: number, comment?: string): Promise<{ message: string; data: IReview }> => {
    const response = await api.post<{ message: string; data: IReview }>(`/review/${productID}`, {
      rate,
      comment,
    });
    return response.data;
  },

  deleteReview: async (reviewID: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/review/${reviewID}`);
    return response.data;
  },
};
