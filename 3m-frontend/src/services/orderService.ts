import { api } from './api';

export interface IShippingAddress {
  street: string;
  city: string;
  phone: string;
}

export interface IOrderItem {
  productID: {
    _id: string;
    name: string;
    imageCover?: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  userID: {
    _id: string;
    name: string;
    email: string;
  };
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  totalPrice: number;
  paymentMethod: 'cash' | 'card';
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  isPaid?: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  message: string;
  data: IOrder;
}

export interface IAnalyticsData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  statusDistribution: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  trend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  bestSellers: Array<{
    _id: string;
    totalSold: number;
    totalRevenue: number;
    name: string;
    imageCover: string;
    price: number;
  }>;
  governorates: Array<{
    city: string;
    revenue: number;
    orders: number;
  }>;
}

export const orderService = {
  createOrder: async (shippingAddress: IShippingAddress, paymentMethod: string, promoCode?: string): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>('/order', { shippingAddress, paymentMethod, promoCode });
    return response.data;
  },

  createDirectOrder: async (productID: string, quantity: number, shippingAddress: IShippingAddress, promoCode?: string): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>('/order/direct', { productID, quantity, shippingAddress, promoCode });
    return response.data;
  },

  getUserOrders: async (): Promise<IOrder[]> => {
    const response = await api.get<{ message: string; data: IOrder[] }>('/order/user');
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<IOrder> => {
    const response = await api.get<{ message: string; data: IOrder }>(`/order/${id}`);
    return response.data.data;
  },

  getAllOrders: async (): Promise<IOrder[]> => {
    const response = await api.get<{ message: string; data: IOrder[] }>('/order');
    return response.data.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<{ message: string; data: IOrder }> => {
    const response = await api.put<{ message: string; data: IOrder }>(`/order/${id}`, { status });
    return response.data;
  },

  getAnalytics: async (): Promise<IAnalyticsData> => {
    const response = await api.get<{ message: string; data: IAnalyticsData }>('/order/admin/analytics');
    return response.data.data;
  }
};
