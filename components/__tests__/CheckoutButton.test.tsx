import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CheckoutButton from '@/components/cart/CheckoutButton';

describe('CheckoutButton', () => {
  const mockOnCheckout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает текст с ценой при isSubmitting=false', () => {
    const { getByText } = render(
      <CheckoutButton totalPrice={1250} isSubmitting={false} onCheckout={mockOnCheckout} />
    );
    expect(getByText('Оформить заказ')).toBeTruthy();
    expect(getByText('1250 ₽')).toBeTruthy();
  });

  it('отображает ActivityIndicator при isSubmitting=true', () => {
    const { queryByText, getByTestId } = render(
      <CheckoutButton totalPrice={1250} isSubmitting={true} onCheckout={mockOnCheckout} />
    );
    // текст оформления скрыт
    expect(queryByText('Оформить заказ')).toBeNull();
    // кнопка с testID присутствует (содержит спиннер)
    expect(getByTestId('cart-checkout-btn')).toBeTruthy();
  });

  it('вызывает onCheckout при нажатии (isSubmitting=false)', () => {
    const { getByTestId } = render(
      <CheckoutButton totalPrice={500} isSubmitting={false} onCheckout={mockOnCheckout} />
    );
    fireEvent.press(getByTestId('cart-checkout-btn'));
    expect(mockOnCheckout).toHaveBeenCalledTimes(1);
  });

  it('не вызывает onCheckout при нажатии (isSubmitting=true)', () => {
    const { getByTestId } = render(
      <CheckoutButton totalPrice={500} isSubmitting={true} onCheckout={mockOnCheckout} />
    );
    fireEvent.press(getByTestId('cart-checkout-btn'));
    expect(mockOnCheckout).not.toHaveBeenCalled();
  });
});
