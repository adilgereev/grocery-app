import { supabase } from '@/lib/services/supabase';
import { Story } from '@/types';

/**
 * Получить все активные сторис, отсортированные по sort_order.
 */
export async function fetchActiveStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as Story[]) || [];
}
