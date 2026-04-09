import { useCategoryStore } from '../categoryStore';

// Моки AsyncStorage теперь в jest.setup.js


// Используем jest.doMock для перехвата динамических импортов в сторе
// Важно: jest.mock хойстится, поэтому для тонкой настройки иногда лучше doMock внутри тестов,
// но здесь мы попробуем сначала "чистый" jest.mock с правильной структурой модуля.
jest.mock('@/lib/api/categoriesApi', () => ({
  __esModule: true,
  fetchRootCategories: jest.fn(),
  fetchFullHierarchy: jest.fn(),
  fetchCategoriesWithHierarchy: jest.fn(),
}));

const mockCategory = {
  id: 'cat-1',
  name: 'Овощи',
  slug: 'vegetables',
  image_url: null,
  parent_id: null,
  sort_order: 1,
};

describe('useCategoryStore', () => {
  let categoriesApi: any;

  beforeAll(() => {
    // В Jest mock-модули можно получить через require
    categoriesApi = require('@/lib/api/categoriesApi');
  });

  beforeEach(() => {
    // Очищаем кэш и стейт перед каждым тестом
    useCategoryStore.getState().invalidateCache();
    useCategoryStore.setState({ 
      rootCategories: [], 
      categoriesWithSubs: [], 
      allCategories: [],
      error: null,
      isLoading: false,
      lastFetch: null
    });
    jest.clearAllMocks();
  });

  it('должен начинаться с пустого состояния', () => {
    const state = useCategoryStore.getState();
    expect(state.rootCategories).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('должен вызывать API при первом запросе категорий', async () => {
    const mock = categoriesApi.fetchRootCategories as jest.Mock;
    mock.mockResolvedValue([mockCategory]);

    await useCategoryStore.getState().fetchRootCategories();

    // Проверяем стейт на ошибки, если вызов не прошел
    const state = useCategoryStore.getState();
    if (state.error) {
      console.error('Store captured error:', state.error);
    }

    expect(mock).toHaveBeenCalledTimes(1);
    expect(state.rootCategories).toEqual([mockCategory]);
  });

  it('должен использовать кэш при повторном запросе (в пределах таймаута)', async () => {
    const mock = categoriesApi.fetchRootCategories as jest.Mock;
    mock.mockResolvedValue([mockCategory]);

    // Первый вызов
    await useCategoryStore.getState().fetchRootCategories();
    // Второй вызов
    await useCategoryStore.getState().fetchRootCategories();

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('должен игнорировать кэш при forceRefresh=true', async () => {
    const mock = categoriesApi.fetchRootCategories as jest.Mock;
    mock.mockResolvedValue([mockCategory]);

    await useCategoryStore.getState().fetchRootCategories();
    await useCategoryStore.getState().fetchRootCategories(true);

    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('должен загружать полную иерархию (fetchFullHierarchy)', async () => {
    const mockHiearchy = [{ ...mockCategory, subcategories: [] }];
    const mockFull = categoriesApi.fetchFullHierarchy as jest.Mock;
    mockFull.mockResolvedValue(mockHiearchy);

    await useCategoryStore.getState().fetchFullHierarchy();

    const state = useCategoryStore.getState();
    expect(state.categoriesWithSubs).toEqual(mockHiearchy);
    expect(state.rootCategories[0].id).toBe('cat-1');
  });

  it('должен находить категорию по ID (getCategoryById)', async () => {
    useCategoryStore.setState({ 
      allCategories: [{ ...mockCategory, parent_name: null } as any] 
    });
    
    const cat = useCategoryStore.getState().getCategoryById('cat-1');
    expect(cat).toBeDefined();
    expect(cat?.name).toBe('Овощи');
  });

  it('инвалидация кэша должна сбрасывать lastFetch', async () => {
    const mock = categoriesApi.fetchRootCategories as jest.Mock;
    mock.mockResolvedValue([mockCategory]);

    await useCategoryStore.getState().fetchRootCategories();
    useCategoryStore.getState().invalidateCache();
    await useCategoryStore.getState().fetchRootCategories();

    expect(mock).toHaveBeenCalledTimes(2);
  });
});
