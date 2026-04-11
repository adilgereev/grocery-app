import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CartItem from '@/components/cart/CartItem';
import { Product } from '@/types';

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

describe('CartItem', () => {
  const mockItem = {
    product: mockProduct,
    quantity: 2,
  };

  const mockUpdateQuantity = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product details correctly', () => {
    const { getByText, getByTestId } = render(
      <CartItem
        item={mockItem}
        index={0}
        onUpdateQuantity={mockUpdateQuantity}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Яблоки')).toBeTruthy();
    expect(getByText('кг')).toBeTruthy();
    expect(getByText('200 ₽')).toBeTruthy(); // 100 * 2
    expect(getByText('100 ₽ / кг')).toBeTruthy();
    expect(getByTestId('quantity-text').props.children).toBe(2);
  });

  it('calls onUpdateQuantity when increase/decrease buttons are pressed', () => {
    const { getByTestId } = render(
      <CartItem
        item={mockItem}
        index={0}
        onUpdateQuantity={mockUpdateQuantity}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByTestId('quantity-increase'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 3);

    fireEvent.press(getByTestId('quantity-decrease'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 1);
  });

  it('calls onUpdateQuantity with 0 when minus is pressed at quantity=1', () => {
    const singleItem = { product: mockProduct, quantity: 1 };
    const { getByTestId } = render(
      <CartItem
        item={singleItem}
        index={0}
        onUpdateQuantity={mockUpdateQuantity}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByTestId('quantity-decrease'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 0);
  });

  it('calls onPress when item is pressed', () => {
    const { getByTestId } = render(
      <CartItem
        item={mockItem}
        index={0}
        onUpdateQuantity={mockUpdateQuantity}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByTestId('cart-item-touchable'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
