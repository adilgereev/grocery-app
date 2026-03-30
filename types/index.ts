export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at?: string;
}

// Интерфейс для родительской категории с её подкатегориями
export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

// Интерфейс для категорий с расширенной информацией (из view categories_with_hierarchy)
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
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  payment_method: 'online' | 'cash';
  created_at?: string;
}

export interface ProductWithCategory extends Product {
  category?: { name: string } | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  is_admin: boolean | null;
  created_at?: string;
}
