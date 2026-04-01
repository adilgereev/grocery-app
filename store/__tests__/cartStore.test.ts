import { useCartStore } from '../cartStore';
import { Product } from '@/types';

// AsyncStorage теперь мокается в jest.setup.js


const mockProduct: Product = {
  id: 'prod-1',
  name: 'Яблоки',
  price: 100,
  image_url: 'https://example.com/apple.png',
  unit: 'кг',
  category_id: 'cat-1',
  description: 'Вкусные яблоки',
  is_active: true,
  stock: 100,
  tags: [],
  created_at: '',
  calories: null,
  proteins: null,
  fats: null,
  carbohydrates: null,
};

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Молоко',
  price: 80,
  image_url: 'https://example.com/milk.png',
  unit: 'шт',
  category_id: 'cat-2',
  description: 'Свежее молоко',
  is_active: true,
  stock: 50,
  tags: [],
  created_at: '',
  calories: null,
  proteins: null,
  fats: null,
  carbohydrates: null,
};

describe('useCartStore', () => {
  beforeEach(() => {
    // Сброс стейта перед каждым тестом
    useCartStore.getState().clearCart();
  });

  it('должен начинаться с пустого состояния', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalPrice).toBe(0);
    expect(state.totalItems).toBe(0);
  });

  it('должен добавлять новый товар в корзину', () => {
    useCartStore.getState().addItem(mockProduct);
    const state = useCartStore.getState();

    expect(state.items.length).toBe(1);
    expect(state.items[0].product.id).toBe('prod-1');
    expect(state.items[0].quantity).toBe(1);
    expect(state.totalPrice).toBe(190); // 100 + 90 доставка
    expect(state.totalItems).toBe(1);
  });

  it('должен увеличивать количество при добавлении существующего товара', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);
    const state = useCartStore.getState();

    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.totalPrice).toBe(290); // 200 + 90 доставка
    expect(state.totalItems).toBe(2);
  });

  it('должен удалять товар из корзины', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().removeItem(mockProduct.id);
    const state = useCartStore.getState();

    expect(state.items.length).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('должен обновлять количество товара вручную', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().updateQuantity(mockProduct.id, 5);
    const state = useCartStore.getState();

    expect(state.items[0].quantity).toBe(5);
    expect(state.totalPrice).toBe(590); // 500 + 90 доставка
    expect(state.totalItems).toBe(5);
  });

  it('должен удалять товар, если количество установлено в 0 или меньше', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().updateQuantity(mockProduct.id, 0);
    const state = useCartStore.getState();

    expect(state.items.length).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('должен корректно добавлять группу товаров (batch addition)', () => {
    useCartStore.getState().addItemsBatch([
      { product: mockProduct, quantity: 2 },
      { product: mockProduct2, quantity: 1 }
    ]);
    const state = useCartStore.getState();

    expect(state.items.length).toBe(2);
    expect(state.totalItems).toBe(3);
    expect(state.totalPrice).toBe(370); // (100 * 2) + 80 + 90 доставка
  });

  it('должен предоставлять бесплатную доставку от 700 ₽', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().updateQuantity(mockProduct.id, 7);
    const state = useCartStore.getState();

    expect(state.subtotal).toBe(700);
    expect(state.deliveryFee).toBe(0);
    expect(state.totalPrice).toBe(700);
  });

  it('должен полностью очищать корзину', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct2);
    useCartStore.getState().clearCart();
    const state = useCartStore.getState();

    expect(state.items.length).toBe(0);
    expect(state.totalPrice).toBe(0);
    expect(state.totalItems).toBe(0);
  });
});
