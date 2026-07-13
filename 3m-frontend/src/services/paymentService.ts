import { api } from './api';

export interface CreatePaymentIntentResponse {
  message: string;
  clientSecret: string;
}

export const paymentService = {
  createPaymentIntent: async (totalAmount: number, orderId: string): Promise<CreatePaymentIntentResponse> => {
    const response = await api.post<CreatePaymentIntentResponse>('/payment/create-intent', {
      totalAmount,
      orderId,
    });
    return response.data;
  },
};
