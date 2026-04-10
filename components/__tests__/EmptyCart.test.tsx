import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyCart from '@/components/cart/EmptyCart';

// CartRecommendations имеет собственные сетевые зависимости — мокируем
jest.mock('@/components/cart/CartRecommendations', () => () => null);

describe('EmptyCart', () => {
  const mockOnGoShopping = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает текст пустой корзины', () => {
    const { getByText } = render(<EmptyCart insetsTop={0} onGoShopping={mockOnGoShopping} />);
    expect(getByText('В корзине пусто')).toBeTruthy();
    expect(getByText('Корзина')).toBeTruthy();
  });

  it('нажатие на кнопку вызывает onGoShopping', () => {
    const { getByTestId } = render(<EmptyCart insetsTop={0} onGoShopping={mockOnGoShopping} />);
    fireEvent.press(getByTestId('cart-go-shopping-btn'));
    expect(mockOnGoShopping).toHaveBeenCalledTimes(1);
  });
});
