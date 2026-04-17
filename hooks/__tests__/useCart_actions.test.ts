import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
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

const mockProduct2: Product = {
  id: 'prod-2', name: 'Молоко', price: 80,
  image_url: 'https://example.com/milk.png', unit: 'шт',
  category_id: 'cat-2', description: '', is_active: true, stock: 50,
  tags: [], created_at: '', calories: null, proteins: null, fats: null, carbohydrates: null,
};

/**
 * Часть 2 тестов useCart: Undo-логика, таймеры и очистка корзины.
 */
describe('useCart - Actions & Timers', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --- Undo-логика ---

  it('pendingRemoval сбрасывается автоматически через 4000мс', () => {
    useCartStore.getState().addItem(mockProduct);
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleQuantityUpdate('prod-1', 0); });
    expect(result.current.pendingRemoval).not.toBeNull();
    act(() => { jest.advanceTimersByTime(4000); });
    expect(result.current.pendingRemoval).toBeNull();
  });

  it('handleUndo восстанавливает товар в store и сбрасывает pendingRemoval', () => {
    useCartStore.getState().addItem(mockProduct);
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleQuantityUpdate('prod-1', 0); });
    act(() => { result.current.handleUndo(); });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(result.current.pendingRemoval).toBeNull();
  });

  it('handleUndo вызывает Haptics.impactAsync', () => {
    useCartStore.getState().addItem(mockProduct);
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleQuantityUpdate('prod-1', 0); });
    act(() => { result.current.handleUndo(); });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('handleUndo ничего не делает без pendingRemoval', () => {
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleUndo(); });
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('handleUndoDismiss сбрасывает pendingRemoval без восстановления товара', () => {
    useCartStore.getState().addItem(mockProduct);
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleQuantityUpdate('prod-1', 0); });
    act(() => { result.current.handleUndoDismiss(); });
    expect(result.current.pendingRemoval).toBeNull();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  // --- Отмена предыдущего таймера ---

  it('удаление второго товара отменяет таймер первого', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct2);
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { result } = renderHook(() => useCart());

    act(() => { result.current.handleQuantityUpdate('prod-1', 0); });
    const firstTimerId = result.current.pendingRemoval?.timerId;

    act(() => { result.current.handleQuantityUpdate('prod-2', 0); });

    expect(clearTimeoutSpy).toHaveBeenCalledWith(firstTimerId);
    expect(result.current.pendingRemoval?.item.product.id).toBe('prod-2');
    clearTimeoutSpy.mockRestore();
  });

  // --- Cleanup при размонтировании ---

  it('unmount отменяет pending таймер', () => {
    useCartStore.getState().addItem(mockProduct);
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { result, unmount } = renderHook(() => useCart());

    act(() => { result.current.handleQuantityUpdate('prod-1', 0); });
    const timerId = result.current.pendingRemoval?.timerId;
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timerId);
    clearTimeoutSpy.mockRestore();
  });

  // --- handleClearCart ---

  it('handleClearCart показывает Alert с заголовком', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleClearCart(); });
    expect(alertSpy.mock.calls[0][0]).toBe('Очистить корзину');
    alertSpy.mockRestore();
  });

  it('handleClearCart: подтверждение очищает корзину', () => {
    useCartStore.getState().addItem(mockProduct);
    let onConfirm: (() => void) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      onConfirm = (buttons as { onPress?: () => void }[])?.[1]?.onPress;
    });
    const { result } = renderHook(() => useCart());
    act(() => { result.current.handleClearCart(); });
    act(() => { onConfirm?.(); });
    expect(useCartStore.getState().items).toHaveLength(0);
    jest.restoreAllMocks();
  });
});
