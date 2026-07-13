import { api } from './api';
import type { IProduct, ICategory } from '../types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  categoryID?: string;
  sort?: string;
}

export interface ProductsResponse {
  message: string;
  data: IProduct[];
  pagination?: {
    totalProducts?: number;
    totalPages?: number;
    currentPage?: number;
    limit?: number;
  };
}

const mockCategories: ICategory[] = [
  {
    _id: 'cat-1',
    userID: 'admin',
    name: 'ملابس رجالية',
    description: 'أحدث خطوط الموضة الرجالية الكاجوال والشبابية',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'cat-2',
    userID: 'admin',
    name: 'أطقم كاجوال',
    description: 'تشكيلة مميزة من الأطقم الشبابية الكاملة',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockProducts: IProduct[] = [
  {
    _id: 'prod-1',
    userID: 'admin',
    categoryID: mockCategories[0],
    name: 'قميص مخطط أحمر وأسود',
    description: 'قميص قطني كاجوال مخطط باللونين الأحمر والأسود، مريح ومناسب للاستخدام اليومي والطلعات الشبابية.',
    images: ['/p1.jpeg', '/p2.jpeg', '/p3.jpeg'],
    imageCover: '/p1.jpeg',
    price: 1200,
    quantity: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-2',
    userID: 'admin',
    categoryID: mockCategories[0],
    name: 'طقم رياضي رمادي وأبيض',
    description: 'طقم رياضي مريح يتكون من تيشيرت بأكمام رمادية وبنطلون رياضي أسود، مثالي للأنشطة اليومية والرياضة.',
    images: ['/p2.jpeg'],
    imageCover: '/p2.jpeg',
    price: 950,
    quantity: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-3',
    userID: 'admin',
    categoryID: mockCategories[0],
    name: 'تيشيرت بولو مخطط',
    description: 'تيشيرت بولو كلاسيكي مخطط باللونين الأبيض والأسود مع بنطلون أسود أنيق يعطيك إطلالة صيفية جذابة.',
    images: ['/p3.jpeg'],
    imageCover: '/p3.jpeg',
    price: 800,
    quantity: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-4',
    userID: 'admin',
    categoryID: mockCategories[1],
    name: 'طقم كاجوال صيفي كامل',
    description: 'طقم كاجوال متميز يشمل تيشيرت أبيض قطني وبنطلون زيتي مريح مع حذاء رياضي أبيض لإطلالة عصرية متكاملة.',
    images: ['/p4.jpeg'],
    imageCover: '/p4.jpeg',
    price: 650,
    quantity: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const productService = {
 
  getProducts: async (params?: GetProductsParams): Promise<ProductsResponse> => {
    try {
      const response = await api.get<ProductsResponse>('/product', { params });
      return response.data;
    } catch (err) {
      console.warn('API /product failed, falling back to mock products:', err);
      let data = [...mockProducts];
      if (params?.categoryID) {
        data = data.filter(p => {
          const catId = typeof p.categoryID === 'object' ? p.categoryID?._id : p.categoryID;
          return catId === params.categoryID;
        });
      }
      if (params?.keyword) {
        const query = params.keyword.toLowerCase();
        data = data.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      }
      return {
        message: 'Mock fallback products response',
        data,
        pagination: {
          totalProducts: data.length,
          totalPages: 1,
          currentPage: 1,
          limit: params?.limit || 10
        }
      };
    }
  },


  getProductById: async (id: string): Promise<{ message: string; product: IProduct }> => {
    try {
      const response = await api.get<{ message: string; data: IProduct }>(`/product/${id}`);
      return {
        message: response.data.message,
        product: response.data.data
      };
    } catch (err) {
      console.warn(`API /product/${id} failed, falling back to mock product:`, err);
      const mockProd = mockProducts.find(p => p._id === id) || mockProducts[0];
      return {
        message: 'Mock fallback product response',
        product: mockProd
      };
    }
  },

  
  getCategories: async (): Promise<{ message: string; data: ICategory[] }> => {
    try {
      const response = await api.get<{ message: string; data: ICategory[] }>('/category');
      return response.data;
    } catch (err) {
      console.warn('API /category failed, falling back to mock categories:', err);
      return {
        message: 'Mock fallback categories response',
        data: mockCategories
      };
    }
  },

  createProduct: async (formData: FormData): Promise<{ message: string; product: IProduct }> => {
    const response = await api.post<{ message: string; product: IProduct }>('/product/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id: string, formData: FormData): Promise<{ message: string; product: IProduct }> => {
    const response = await api.put<{ message: string; product: IProduct }>(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/product/${id}`);
    return response.data;
  },

  createCategory: async (name: string, description: string): Promise<{ message: string; data: ICategory }> => {
    const response = await api.post<{ message: string; data: ICategory }>('/category/add', { name, description });
    return response.data;
  },

  updateCategory: async (id: string, name: string, description: string): Promise<{ message: string; data: ICategory }> => {
    const response = await api.put<{ message: string; data: ICategory }>(`/category/${id}`, { name, description });
    return response.data;
  },

  deleteCategory: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/category/${id}`);
    return response.data;
  },
};
