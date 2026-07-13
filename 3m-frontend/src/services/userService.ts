import { api } from './api';
import type { IUser } from '../types';

export interface UsersResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  data: IUser[];
}


const localUsers: IUser[] = [
  {
    _id: 'user-1',
    name: 'أحمد علي',
    email: 'ahmed@3m.com',
    address: { street: 'شارع المعز', city: 'القاهرة', country: 'مصر' },
    role: 'admin',
    isVerified: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'user-2',
    name: 'محمود عزب',
    email: 'mahmoud@3m.com',
    address: { street: 'شارع النصر', city: 'الإسكندرية', country: 'مصر' },
    role: 'admin',
    isVerified: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'user-3',
    name: 'سارة محمد',
    email: 'sara@gmail.com',
    address: { street: 'شارع الهرم', city: 'الجيزة', country: 'مصر' },
    role: 'user',
    isVerified: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'user-4',
    name: 'كريم خالد',
    email: 'karim@gmail.com',
    address: { street: 'شارع الجمهورية', city: 'طنطا', country: 'مصر' },
    role: 'user',
    isVerified: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const userService = {
  getAllUsers: async (page = 1, limit = 10): Promise<UsersResponse> => {
    try {
      const response = await api.get<UsersResponse>('/user', {
        params: { page, limit }
      });
      return response.data;
    } catch (err) {
      console.warn('API /user failed, falling back to mock users:', err);

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = localUsers.slice(start, end);
      return {
        message: 'Mock fallback users response',
        page,
        limit,
        total: localUsers.length,
        data: paginatedData
      };
    }
  },

  updateUser: async (id: string, name: string): Promise<{ message: string; data: IUser }> => {
    try {
      const response = await api.put<{ message: string; data: IUser }>(`/user/${id}`, { name });
      return response.data;
    } catch (err) {
      console.warn(`API PUT /user/${id} failed, updating local mock users:`, err);
      const userIndex = localUsers.findIndex(u => u._id === id);
      if (userIndex > -1) {
        localUsers[userIndex] = {
          ...localUsers[userIndex],
          name,
          updatedAt: new Date().toISOString()
        };
        return {
          message: 'Mock user updated successfully',
          data: localUsers[userIndex]
        };
      }
      throw new Error('User not found in mock storage');
    }
  },

  deleteUser: async (id: string): Promise<{ message: string; deletedUser?: IUser }> => {
    try {
      const response = await api.delete<{ message: string; deletedUser: IUser }>(`/user/${id}`);
      return response.data;
    } catch (err) {
      console.warn(`API DELETE /user/${id} failed, deleting from local mock users:`, err);
      const userIndex = localUsers.findIndex(u => u._id === id);
      if (userIndex > -1) {
        const [deleted] = localUsers.splice(userIndex, 1);
        return {
          message: 'Mock user deleted successfully',
          deletedUser: deleted
        };
      }
      throw new Error('User not found in mock storage');
    }
  }
};
