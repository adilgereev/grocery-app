import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

// Мокаем стор корзины
jest.mock('@/store/cartStore', () => ({
  useCartStore: jest.fn(),
}));

const mockProduct: Product = {
  id: 'p1',
  name: 'Бананы',
  price: 150,
  unit: 'кг',
  image_url: 'https://example.com/banana.jpg',
  category_id: 'c1',
  description: 'Свежие бананы',
  stock: 50,
  is_active: true,
  tags: [],
  created_at: '',
  calories: null,
  proteins: null,
  fats: null,
  carbohydrates: null,
};

describe('ProductCard', () => {
  const mockAddItem = jest.fn();
  const mockUpdateQuantity = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Хелпер: имитирует selector-вызов useCartStore(selector => selector(state))
  const mockStore = (items: { product: typeof mockProduct; quantity: number }[]) => {
    const state = { items, addItem: mockAddItem, updateQuantity: mockUpdateQuantity };
    (useCartStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof state) => unknown) => selector(state));
  };

  it('renders correctly when item is not in cart', () => {
    mockStore([]);

    const { getByText, getByTestId, queryByTestId } = render(
      <ProductCard item={mockProduct} onPress={mockOnPress} />
    );

    expect(getByText('Бананы')).toBeTruthy();
    expect(getByText('150 ₽')).toBeTruthy();
    expect(getByText('/ кг')).toBeTruthy();
    expect(getByTestId('product-add-button')).toBeTruthy();
    expect(queryByTestId('product-increase-button')).toBeNull();
  });

  it('calls addItem when add button is pressed', () => {
    mockStore([]);

    const { getByTestId } = render(<ProductCard item={mockProduct} onPress={mockOnPress} />);

    fireEvent.press(getByTestId('product-add-button'));
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
  });

  it('renders correctly when item is already in cart', () => {
    mockStore([{ product: mockProduct, quantity: 3 }]);

    const { getByTestId, queryByTestId } = render(
      <ProductCard item={mockProduct} onPress={mockOnPress} />
    );

    expect(queryByTestId('product-add-button')).toBeNull();
    expect(getByTestId('product-increase-button')).toBeTruthy();
    expect(getByTestId('product-decrease-button')).toBeTruthy();
    expect(getByTestId('product-quantity-text').props.children).toBe(3);
  });

  it('calls updateQuantity when +/- buttons are pressed', () => {
    mockStore([{ product: mockProduct, quantity: 3 }]);

    const { getByTestId } = render(<ProductCard item={mockProduct} onPress={mockOnPress} />);

    fireEvent.press(getByTestId('product-increase-button'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 4);

    fireEvent.press(getByTestId('product-decrease-button'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 2);
  });

  it('calls onPress when card is pressed', () => {
    mockStore([]);

    const { getByTestId } = render(<ProductCard item={mockProduct} onPress={mockOnPress} />);

    fireEvent.press(getByTestId('product-card'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
