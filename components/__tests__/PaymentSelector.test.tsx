import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PaymentSelector from '@/components/cart/PaymentSelector';

describe('PaymentSelector', () => {
  const mockSetPaymentMethod = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает оба способа оплаты', () => {
    const { getByTestId } = render(
      <PaymentSelector paymentMethod="cash" setPaymentMethod={mockSetPaymentMethod} disabled={false} />
    );
    expect(getByTestId('payment-method-cash')).toBeTruthy();
    expect(getByTestId('payment-method-online')).toBeTruthy();
  });

  it('нажатие на cash вызывает setPaymentMethod("cash")', () => {
    const { getByTestId } = render(
      <PaymentSelector paymentMethod="online" setPaymentMethod={mockSetPaymentMethod} disabled={false} />
    );
    fireEvent.press(getByTestId('payment-method-cash'));
    expect(mockSetPaymentMethod).toHaveBeenCalledWith('cash');
  });

  it('нажатие на online вызывает setPaymentMethod("online")', () => {
    const { getByTestId } = render(
      <PaymentSelector paymentMethod="cash" setPaymentMethod={mockSetPaymentMethod} disabled={false} />
    );
    fireEvent.press(getByTestId('payment-method-online'));
    expect(mockSetPaymentMethod).toHaveBeenCalledWith('online');
  });

  it('disabled=true блокирует вызов setPaymentMethod', () => {
    const { getByTestId } = render(
      <PaymentSelector paymentMethod="cash" setPaymentMethod={mockSetPaymentMethod} disabled={true} />
    );
    fireEvent.press(getByTestId('payment-method-online'));
    expect(mockSetPaymentMethod).not.toHaveBeenCalled();
  });

  it('отображает текст выбранного метода', () => {
    const { getByText } = render(
      <PaymentSelector paymentMethod="cash" setPaymentMethod={mockSetPaymentMethod} disabled={false} />
    );
    expect(getByText('Наличными курьеру')).toBeTruthy();
    expect(getByText('Онлайн')).toBeTruthy();
  });
});
