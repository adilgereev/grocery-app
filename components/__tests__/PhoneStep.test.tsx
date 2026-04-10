import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PhoneStep } from '@/components/auth/PhoneStep';

describe('PhoneStep', () => {
  const mockOnPhoneChange = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPhoneStep = (overrides = {}) =>
    render(
      <PhoneStep
        phone=""
        loading={false}
        onPhoneChange={mockOnPhoneChange}
        onContinue={mockOnContinue}
        {...overrides}
      />
    );

  it('отображает поле ввода телефона и кнопку', () => {
    const { getByTestId } = renderPhoneStep();
    expect(getByTestId('login-phone-input')).toBeTruthy();
    expect(getByTestId('login-continue-button')).toBeTruthy();
  });

  it('форматирует ввод в маску +7 (XXX) XXX-XX-XX', () => {
    renderPhoneStep();
    // Симулируем ввод 11 цифр
    const { getByTestId } = renderPhoneStep();
    fireEvent.changeText(getByTestId('login-phone-input'), '79001234567');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('+7 (900) 123-45-67');
  });

  it('конвертирует ввод начинающийся на 8 в +7', () => {
    const { getByTestId } = renderPhoneStep();
    fireEvent.changeText(getByTestId('login-phone-input'), '89001234567');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('+7 (900) 123-45-67');
  });

  it('нажатие на кнопку вызывает onContinue (loading=false)', () => {
    const { getByTestId } = renderPhoneStep();
    fireEvent.press(getByTestId('login-continue-button'));
    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it('loading=true блокирует вызов onContinue', () => {
    const { getByTestId } = renderPhoneStep({ loading: true });
    fireEvent.press(getByTestId('login-continue-button'));
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('loading=true скрывает текст кнопки', () => {
    const { queryByText } = renderPhoneStep({ loading: true });
    expect(queryByText('Продолжить')).toBeNull();
  });
});
