import type { Enums } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  image_transformations?: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  stock: number;
  created_at?: string;
  tags: string[] | null;
  calories: number | null;
  proteins: number | null;
  fats: number | null;
  carbohydrates: number | null;
}

export interface Order {
  id: string;
  user_id: string;
  status: Enums<'order_status'>;
  total_amount: number;
  delivery_address: string;
  payment_method: Enums<'payment_method'>;
  comment?: string | null;
  promo_code?: string | null;
  discount_amount?: number | null;
  created_at?: string;
}

export interface ProductWithCategory extends Product {
  category?: { name: string } | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  phone: string;
  avatar_url: string | null;
  is_admin: boolean | null;
  created_at?: string;
}
