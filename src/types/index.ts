/*
 * ============================================
 * MINDS MATTER — TypeScript Type Definitions
 * ============================================
 * These interfaces define the "shape" of our data.
 * Think of them as blueprints that describe what
 * a Product, Order, CartItem, etc. look like.
 *
 * TypeScript will warn us if we try to use a
 * property that doesn't exist — catching bugs
 * before they happen.
 * ============================================
 */

// ── Category ──
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

// ── Product ──
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  currency: string;
  category_id: string;
  category_name?: string; // Joined from categories table
  cover_image: string;
  gallery_images: string[];
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  author?: string;
  pages?: number;
  age_range?: string;
  difficulty?: string;
  format?: string;
  dimensions?: string;
  weight?: number;
  created_at: string;
  updated_at: string;
}

// ── Cart ──
export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Order ──
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  transaction_reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

// ── User Profile ──
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  phone?: string;
}

// ── Checkout Form ──
export interface CheckoutFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  country: string;
  payment_method: 'mpesa' | 'card';
}
