import type { Enums } from './supabase';

export type PaymentMethod = Enums<'payment_method'>;

export interface Address {
  id: string;
  text: string;
  house?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  apartment?: string;
  comment?: string;
  is_selected: boolean;
  lat?: number;
  lon?: number;
}

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

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export interface CategoryWithHierarchy extends Category {
  parent_name: string | null;
  parent_slug: string | null;
  parent_image_url: string | null;
  is_root: boolean | null;
  subcategory_count: number | null;
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
  created_at?: string;
}

export interface ProductWithCategory extends Product {
  category?: { name: string } | null;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  type: 'promo' | 'new_product';
  is_active: boolean;
  sort_order: number;
  expires_at: string | null;
  created_at?: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  phone: string;
  avatar_url: string | null;
  is_admin: boolean | null;
  created_at?: string;
}
