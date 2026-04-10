import { useFavoriteStore } from '../favoriteStore';
import { fetchFavoriteIds, addToFavorites, removeFromFavorites } from '@/lib/api/favoriteApi';
import { Product } from '@/types';

jest.mock('@/lib/api/favoriteApi', () => ({
  fetchFavoriteIds: jest.fn(),
  addToFavorites: jest.fn(),
  removeFromFavorites: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn() },
}));

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Яблоки',
  price: 100,
  image_url: null,
  unit: 'кг',
  category_id: 'cat-1',
  description: null,
  is_active: true,
  stock: 10,
  tags: [],
  created_at: '',
  calories: null,
  proteins: null,
  fats: null,
  carbohydrates: null,
};

describe('useFavoriteStore', () => {
  beforeEach(() => {
    useFavoriteStore.setState({ favoriteIds: [], isLoading: false, error: null });
    jest.clearAllMocks();
  });

  it('начальное состояние корректно', () => {
    const state = useFavoriteStore.getState();
    expect(state.favoriteIds).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchFavorites', () => {
    it('успешная загрузка заполняет favoriteIds и сбрасывает isLoading', async () => {
      (fetchFavoriteIds as jest.Mock).mockResolvedValue(['id-1', 'id-2']);
      await useFavoriteStore.getState().fetchFavorites('user-123');
      const state = useFavoriteStore.getState();
      expect(state.favoriteIds).toEqual(['id-1', 'id-2']);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('ошибка загрузки устанавливает error и сбрасывает isLoading', async () => {
      (fetchFavoriteIds as jest.Mock).mockRejectedValue(new Error('Сеть недоступна'));
      await useFavoriteStore.getState().fetchFavorites('user-123');
      const state = useFavoriteStore.getState();
      expect(state.error).toBe('Сеть недоступна');
      expect(state.isLoading).toBe(false);
      expect(state.favoriteIds).toEqual([]);
    });
  });

  describe('toggleFavorite — добавление', () => {
    it('оптимистично добавляет id и вызывает addToFavorites', async () => {
      (addToFavorites as jest.Mock).mockResolvedValue(undefined);
      await useFavoriteStore.getState().toggleFavorite(mockProduct, 'user-123');
      expect(useFavoriteStore.getState().favoriteIds).toContain('prod-1');
      expect(addToFavorites).toHaveBeenCalledWith('user-123', 'prod-1');
    });
  });

  describe('toggleFavorite — удаление', () => {
    it('оптимистично убирает id и вызывает removeFromFavorites', async () => {
      useFavoriteStore.setState({ favoriteIds: ['prod-1'] });
      (removeFromFavorites as jest.Mock).mockResolvedValue(undefined);
      await useFavoriteStore.getState().toggleFavorite(mockProduct, 'user-123');
      expect(useFavoriteStore.getState().favoriteIds).not.toContain('prod-1');
      expect(removeFromFavorites).toHaveBeenCalledWith('user-123', 'prod-1');
    });
  });

  describe('toggleFavorite — откат при ошибке API', () => {
    it('откатывает состояние к предыдущему и устанавливает error', async () => {
      useFavoriteStore.setState({ favoriteIds: ['existing-id'] });
      (addToFavorites as jest.Mock).mockRejectedValue(new Error('Ошибка API'));
      await useFavoriteStore.getState().toggleFavorite(mockProduct, 'user-123');
      const state = useFavoriteStore.getState();
      // prod-1 не должен остаться — откат к предыдущим ids
      expect(state.favoriteIds).toEqual(['existing-id']);
      expect(state.error).toBe('Ошибка API');
    });
  });

  it('clearFavorites очищает favoriteIds и error', () => {
    useFavoriteStore.setState({ favoriteIds: ['id-1'], error: 'Ошибка' });
    useFavoriteStore.getState().clearFavorites();
    const state = useFavoriteStore.getState();
    expect(state.favoriteIds).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('clearError сбрасывает error и isLoading', () => {
    useFavoriteStore.setState({ error: 'Ошибка', isLoading: true });
    useFavoriteStore.getState().clearError();
    const state = useFavoriteStore.getState();
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });
});
