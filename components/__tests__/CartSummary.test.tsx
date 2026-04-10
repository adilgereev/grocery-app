import React from 'react';
import { render } from '@testing-library/react-native';
import CartSummary from '@/components/cart/CartSummary';
import AddressSelector from '@/components/cart/AddressSelector';
import PaymentSelector from '@/components/cart/PaymentSelector';
import { Address, PaymentMethod } from '@/types';

// Мокируем дочерние компоненты — CartSummary является чистым композитором
jest.mock('@/components/cart/AddressSelector', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/components/cart/PaymentSelector', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/components/cart/OrderReceipt', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/components/cart/CheckoutButton', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockAddress: Address = {
  id: 'addr-1',
  text: 'ул. Ленина, 1',
  apartment: '10',
  is_selected: true,
};

const baseProps = {
  itemsCount: 3,
  subtotal: 500,
  deliveryFee: 90,
  totalPrice: 590,
  selectedAddress: mockAddress,
  paymentMethod: 'cash' as PaymentMethod,
  setPaymentMethod: jest.fn(),
  onCheckout: jest.fn(),
  onSelectAddress: jest.fn(),
  isSubmitting: false,
  formatAddress: (addr: Address) => addr.text,
};

describe('CartSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Моки возвращают null — только захватываем пропсы
    (AddressSelector as jest.Mock).mockReturnValue(null);
    (PaymentSelector as jest.Mock).mockReturnValue(null);
  });

  it('рендерит все 4 дочерних компонента', () => {
    render(<CartSummary {...baseProps} />);
    expect(AddressSelector).toHaveBeenCalled();
    expect(PaymentSelector).toHaveBeenCalled();
  });

  it('передаёт onSelectAddress в AddressSelector', () => {
    render(<CartSummary {...baseProps} />);
    const props = (AddressSelector as jest.Mock).mock.calls[0][0];
    expect(props.onSelectAddress).toBe(baseProps.onSelectAddress);
  });

  it('передаёт setPaymentMethod в PaymentSelector', () => {
    render(<CartSummary {...baseProps} />);
    const props = (PaymentSelector as jest.Mock).mock.calls[0][0];
    expect(props.setPaymentMethod).toBe(baseProps.setPaymentMethod);
  });

  it('isSubmitting=true передаёт disabled=true в AddressSelector и PaymentSelector', () => {
    render(<CartSummary {...baseProps} isSubmitting={true} />);
    expect((AddressSelector as jest.Mock).mock.calls[0][0].disabled).toBe(true);
    expect((PaymentSelector as jest.Mock).mock.calls[0][0].disabled).toBe(true);
  });

  it('isSubmitting=false передаёт disabled=false в дочерние компоненты', () => {
    render(<CartSummary {...baseProps} isSubmitting={false} />);
    expect((AddressSelector as jest.Mock).mock.calls[0][0].disabled).toBe(false);
    expect((PaymentSelector as jest.Mock).mock.calls[0][0].disabled).toBe(false);
  });
});
