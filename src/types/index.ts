export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  image?: string;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix';

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  cashierName: string;
  createdAt: Date;
}

export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  topProducts: { name: string; quantity: number }[];
  salesByHour: { hour: string; sales: number }[];
  salesByPayment: { method: string; value: number }[];
}
