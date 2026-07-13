import { api } from './api';
import type { IUser, IAddress } from '../types';


export interface LoginPayload {
  email: string;
  password: string;
}


export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address: IAddress;
  profileImage?: File;
}


export interface AuthResponse {
  message: string;
  user: IUser;
}

export const authService = {
 
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  googleLogin: async (token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', { token });
    return response.data;
  },


  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const formData = new FormData();
    
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    
    
    formData.append('address', JSON.stringify(payload.address));
    
    if (payload.profileImage) {
      formData.append('profileImage', payload.profileImage);
    }

    const response = await api.post<AuthResponse>('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  updateProfileImage: async (file: File): Promise<{ message: string; data: IUser }> => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await api.put<{ message: string; data: IUser }>('/user/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },
};
