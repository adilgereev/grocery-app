import { fetchRootCategories, fetchFullHierarchy, fetchCategoriesWithHierarchy } from '@/lib/api/categoriesApi';
import { supabase } from '@/lib/services/supabase';

// Типизируем мок Supabase для тестов
const mockSupabase = supabase as any;

describe('categoriesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategory = {
    id: 'cat-1',
    name: 'Овощи',
    slug: 'vegetables',
    parent_id: null,
    sort_order: 1,
  };

  const mockSubcategory = {
    id: 'sub-1',
    name: 'Помидоры',
    slug: 'tomatoes',
    parent_id: 'cat-1',
    sort_order: 1,
  };

  describe('fetchRootCategories', () => {
    it('should call supabase with correct filters for root categories', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.is.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      // Имитируем then для await
      mockSupabase.then.mockImplementationOnce((onFulfilled: any) => 
        Promise.resolve({ data: [mockCategory], error: null }).then(onFulfilled)
      );

      const result = await fetchRootCategories();

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockSupabase.is).toHaveBeenCalledWith('parent_id', null);
      expect(mockSupabase.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(result).toEqual([mockCategory]);
    });

    it('should throw error if supabase returns error', async () => {
      mockSupabase.then.mockImplementationOnce((onFulfilled: any) => 
        Promise.resolve({ data: null, error: { message: 'DB Error' } }).then(onFulfilled)
      );

      await expect(fetchRootCategories()).rejects.toThrow('Не удалось загрузить корневые категории: DB Error');
    });
  });

  describe('fetchCategoriesWithHierarchy', () => {
    it('should fetch from categories_with_hierarchy view', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.then.mockImplementationOnce((onFulfilled: any) => 
        Promise.resolve({ data: [], error: null }).then(onFulfilled)
      );

      await fetchCategoriesWithHierarchy();

      expect(mockSupabase.from).toHaveBeenCalledWith('categories_with_hierarchy');
    });
  });

  describe('fetchFullHierarchy', () => {
    it('should build recursive hierarchy using a single query and memory filtering', async () => {
      // Мок возвращает все категории (и корни, и вложенные) за один раз
      mockSupabase.then.mockImplementationOnce((onFulfilled: any) => 
        Promise.resolve({ data: [mockCategory, mockSubcategory], error: null }).then(onFulfilled)
      );

      const result = await fetchFullHierarchy();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('cat-1');
      expect(result[0].subcategories).toEqual([mockSubcategory]);
    });
  });
});
