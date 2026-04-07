import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CartItem from '@/components/cart/CartItem';
import { Product } from '@/types';
import { useRouter } from 'expo-router';

// Моки useRouter уже в jest.setup.js
const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

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
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product details correctly', () => {
    const { getByText, getByTestId } = render(
      <CartItem 
        item={mockItem} 
        index={0} 
        onUpdateQuantity={mockUpdateQuantity} 
        onRemove={mockRemove} 
      />
    );

    expect(getByText('Яблоки')).toBeTruthy();
    expect(getByText('200 ₽')).toBeTruthy(); // 100 * 2
    expect(getByText('100 ₽ / шт')).toBeTruthy();
    expect(getByTestId('quantity-text').props.children).toBe(2);
  });

  it('calls onUpdateQuantity when increase/decrease buttons are pressed', () => {
    const { getByTestId } = render(
      <CartItem 
        item={mockItem} 
        index={0} 
        onUpdateQuantity={mockUpdateQuantity} 
        onRemove={mockRemove} 
      />
    );

    fireEvent.press(getByTestId('quantity-increase'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 3);

    fireEvent.press(getByTestId('quantity-decrease'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 1);
  });

  it('calls onRemove when delete button is pressed', () => {
    const { getByTestId } = render(
      <CartItem 
        item={mockItem} 
        index={0} 
        onUpdateQuantity={mockUpdateQuantity} 
        onRemove={mockRemove} 
      />
    );

    fireEvent.press(getByTestId('remove-item'));
    expect(mockRemove).toHaveBeenCalledWith('prod-1');
  });

  it('navigates to product details when pressed', () => {
    const { getByTestId } = render(
      <CartItem 
        item={mockItem} 
        index={0} 
        onUpdateQuantity={mockUpdateQuantity} 
        onRemove={mockRemove} 
      />
    );

    fireEvent.press(getByTestId('cart-item-touchable'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/product/prod-1'));
  });
});
