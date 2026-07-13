export type Role = 'user' | 'admin';

export interface IAddress {
  street: string;
  city: string;
  country: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  address: IAddress;
  profileImage?: string;
  isVerified: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  userID: string | IUser;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  userID: string | IUser;
  categoryID: string | ICategory;
  name: string;
  description: string;
  images: string[];
  imageCover: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICartItem {
  productID: IProduct;
  quantity: number;
  _id?: string;
}

export interface ICart {
  _id: string;
  userID: string;
  items: ICartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IShippingAddress {
  street: string;
  city: string;
  phone: string;
}

export interface IOrderItem {
  productID: IProduct | string;
  quantity: number;
  price: number;
  _id?: string;
}

export interface IOrder {
  _id: string;
  userID: string | IUser;
  items: IOrderItem[];
  totalPrice: number;
  shippingAddress: IShippingAddress;
  paymentMethod: 'cash' | 'card';
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  userID: string | IUser;
  productID: string | IProduct;
  rate: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
