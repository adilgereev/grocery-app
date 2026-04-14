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

  it('удаление последней цифры из (926) правильно переформатирует', () => {
    const { getByTestId } = renderPhoneStep({ phone: '+7 (926)' });
    // Удаляем последнюю цифру 6 → остаётся +7 (92
    fireEvent.changeText(getByTestId('login-phone-input'), '+7 (92');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('+7 (92');
  });

  it('полная очистка номера возвращает пустую строку', () => {
    const { getByTestId } = renderPhoneStep({ phone: '+7 (926) 123-45-67' });
    fireEvent.changeText(getByTestId('login-phone-input'), '');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('');
  });

  it('удаление всех цифр из полного номера', () => {
    const { getByTestId } = renderPhoneStep({ phone: '+7 (900) 123-45-67' });
    // Симулируем постепенное удаление цифр
    fireEvent.changeText(getByTestId('login-phone-input'), '+7 (900) 123-45-');
    fireEvent.changeText(getByTestId('login-phone-input'), '+7 (900) 123-45');
    fireEvent.changeText(getByTestId('login-phone-input'), '+7 (900) 123-');
    fireEvent.changeText(getByTestId('login-phone-input'), '');
    expect(mockOnPhoneChange).toHaveBeenLastCalledWith('');
  });

  it('сохраняет формат при добавлении цифр к неполному номеру', () => {
    const { getByTestId } = renderPhoneStep({ phone: '+7 (92' });
    fireEvent.changeText(getByTestId('login-phone-input'), '+7 (926)');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('+7 (926)');
  });
});
