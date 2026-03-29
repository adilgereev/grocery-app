import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OrderCard from '../OrderCard';
import { Order } from '@/types';

const mockOrder: Order = {
  id: 'order-123',
  user_id: 'user-1',
  total_amount: 1500,
  delivery_address: 'г. Буйнакск, ул. Ленина, 10',
  status: 'delivered', // Ожидаем: ✅ Доставлен
  created_at: '2024-03-29T12:00:00Z',
  payment_method: 'cash',
};

describe('OrderCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders order details correctly with delivered status', () => {
    const { getByText } = render(
      <OrderCard order={mockOrder} onPress={mockOnPress} />
    );

    expect(getByText('✅')).toBeTruthy();
    expect(getByText('Доставлен')).toBeTruthy();
    expect(getByText('ул. Ленина, 10')).toBeTruthy(); // Ожидаем cleanAddress
    expect(getByText('1500 ₽')).toBeTruthy();
    // Дата форматируется как 29 мар. или аналогично в зависимости от локали
    // Для простоты проверим наличие года или дня
    expect(getByText(/29/)).toBeTruthy();
  });

  it('renders pending status correctly', () => {
    const pendingOrder: Order = { ...mockOrder, status: 'pending' };
    const { getByText } = render(
      <OrderCard order={pendingOrder} onPress={mockOnPress} />
    );

    expect(getByText('📦')).toBeTruthy();
    expect(getByText('Собираем')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const { getByTestId } = render(
      <OrderCard order={mockOrder} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('order-card'));
    expect(mockOnPress).toHaveBeenCalledWith('order-123');
  });

  it('handles missing status gracefully (fallback to pending)', () => {
    const brokenOrder = { ...mockOrder, status: undefined };
    const { getByText } = render(
      <OrderCard order={brokenOrder as any} onPress={mockOnPress} />
    );

    expect(getByText('Собираем')).toBeTruthy();
  });
});
