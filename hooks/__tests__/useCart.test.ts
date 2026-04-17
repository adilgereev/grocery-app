import { act, renderHook } from '@testing-library/react-native';
import { useCart } from '../useCart';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';

const mockNavigateToCheckout = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/hooks/useCheckout', () => ({
  useCheckout: () => ({ navigateToCheckout: mockNavigateToCheckout }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'Medium' },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
}));

const mockProduct: Product = {
  id: 'prod-1', name: 'Яблоки', price: 100,
  image_url: 'https://example.com/apple.png', unit: 'кг',
  category_id: 'cat-1', description: '', is_active: true, stock: 100,
  tags: [], created_at: '', calories: null, proteins: null, fats: null, carbohydrates: null,
};


describe('useCart', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --- Начальное состояние ---

  it('showEmptyCart === true при пустой корзине', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.showEmptyCart).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it('showEmptyCart === false когда есть товары', () => {
    useCartStore.getState().addItem(mockProduct);
    const { result } = renderHook(() => useCart());
    expect(result.current.showEmptyCart).toBe(false);
    expect(result.current.items).toHaveLength(1);
  });

  // --- Навигация ---

  it('handleGoShopping вызывает router.push на главную вкладку', () => {
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleGoShopping(); });
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/(index)');
  });

  it('handleProductPress формирует URL с encoded именем', () => {
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleProductPress('prod-1', 'Яблоки'); });
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/product/prod-1?name=${encodeURIComponent('Яблоки')}`
    );
  });

  // --- handleQuantityUpdate ---

  it('qty > 0 обновляет количество в store', () => {
    useCartStore.getState().addItem(mockProduct);
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleQuantityUpdate('prod-1', 3); });
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('qty = 0 удаляет товар из store и устанавливает pendingRemoval', () => {
    useCartStore.getState().addItem(mockProduct);
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleQuantityUpdate('prod-1', 0); });
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(result.current.pendingRemoval?.item.product.id).toBe('prod-1');
  });

  it('unmount без pendingRemoval не вызывает clearTimeout', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useCart());
    unmount();
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
