import { supabase } from '@/lib/supabase';
import type { Product, ProductWithCategory } from '@/types';

export async function fetchAllProductsWithCategory(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:category_id(name)')
    .order('id', { ascending: false });

  if (error) throw error;
  return (data || []) as ProductWithCategory[];
}

export async function fetchProductForEdit(id: string): Promise<ProductWithCategory | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ProductWithCategory | null;
}

export async function createProduct(productData: {
  name: string;
  description?: string;
  price: number;
  unit: string;
  image_url?: string;
  category_id: string;
  is_active?: boolean;
  stock?: number;
  tags?: string[];
  calories?: number | null;
  proteins?: number | null;
  fats?: number | null;
  carbohydrates?: number | null;
}): Promise<void> {
  const { error } = await supabase
    .from('products')
    .insert(productData);

  if (error) throw error;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
