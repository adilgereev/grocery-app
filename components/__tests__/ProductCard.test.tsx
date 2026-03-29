import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../ProductCard';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'expo-router';

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
};

describe('ProductCard', () => {
  const mockAddItem = jest.fn();
  const mockUpdateQuantity = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders correctly when item is not in cart', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      addItem: mockAddItem,
      updateQuantity: mockUpdateQuantity,
    });

    const { getByText, getByTestId, queryByTestId } = render(
      <ProductCard item={mockProduct} />
    );

    expect(getByText('Бананы')).toBeTruthy();
    expect(getByText('150 ₽')).toBeTruthy();
    expect(getByText('/ кг')).toBeTruthy();
    expect(getByTestId('product-add-button')).toBeTruthy();
    expect(queryByTestId('product-increase-button')).toBeNull();
  });

  it('calls addItem when add button is pressed', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      addItem: mockAddItem,
      updateQuantity: mockUpdateQuantity,
    });

    const { getByTestId } = render(<ProductCard item={mockProduct} />);
    
    fireEvent.press(getByTestId('product-add-button'));
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
  });

  it('renders correctly when item is already in cart', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: mockProduct, quantity: 3 }],
      addItem: mockAddItem,
      updateQuantity: mockUpdateQuantity,
    });

    const { getByTestId, queryByTestId } = render(
      <ProductCard item={mockProduct} />
    );

    expect(queryByTestId('product-add-button')).toBeNull();
    expect(getByTestId('product-increase-button')).toBeTruthy();
    expect(getByTestId('product-decrease-button')).toBeTruthy();
    expect(getByTestId('product-quantity-text').props.children).toBe(3);
  });

  it('calls updateQuantity when +/- buttons are pressed', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [{ product: mockProduct, quantity: 3 }],
      addItem: mockAddItem,
      updateQuantity: mockUpdateQuantity,
    });

    const { getByTestId } = render(<ProductCard item={mockProduct} />);
    
    fireEvent.press(getByTestId('product-increase-button'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 4);

    fireEvent.press(getByTestId('product-decrease-button'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 2);
  });

  it('navigates to product detail when card is pressed', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      addItem: mockAddItem,
      updateQuantity: mockUpdateQuantity,
    });

    const { getByTestId } = render(<ProductCard item={mockProduct} />);
    
    fireEvent.press(getByTestId('product-card'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/product/p1'));
  });
});
