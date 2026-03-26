export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;  // Идентификатор родительской категории для иерархии
  created_at?: string;
}

// Интерфейс для родительской категории с её подкатегориями
export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

// Интерфейс для категорий с расширенной информацией (из view categories_with_hierarchy)
export interface CategoryWithHierarchy extends Category {
  parent_name?: string | null;
  parent_slug?: string | null;
  parent_image_url?: string | null;
  is_root: boolean;
  subcategory_count: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit?: string;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  stock: number;
  created_at?: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  user_id: string;
  city: string;
  street: string;
  house: string;
  apartment: string | null;
  entrance: string | null;
  floor: string | null;
  is_default: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string; // Formatted address string
  payment_method?: 'online' | 'cash';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
}

export interface ProductWithCategory extends Product {
  category?: { name: string } | null;
}

export interface OrderWithItems extends Order {
  items?: (OrderItem & { product?: Product })[];
}
