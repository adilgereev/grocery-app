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

  it('форматирует ввод при потере фокуса (onEndEditing)', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Вводим цифры без форматирования
    fireEvent.changeText(input, '79001234567');

    // onPhoneChange НЕ вызывается во время ввода
    expect(mockOnPhoneChange).not.toHaveBeenCalled();

    // Симулируем потерю фокуса (onEndEditing)
    fireEvent(input, 'endEditing');

    // Теперь форматирование применилось
    expect(mockOnPhoneChange).toHaveBeenCalledWith('+7 (900) 123-45-67');
  });

  it('конвертирует ввод начинающийся на 8 в +7', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    fireEvent.changeText(input, '89001234567');
    fireEvent(input, 'endEditing');

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

  it('нормализует ввод без полного форматирования маски', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Вводим цифры - нормализация происходит, но без маски
    fireEvent.changeText(input, '79001234567');
    expect(input.props.value).toBe('+79001234567');  // Без скобок и дефисов

    // onPhoneChange не вызывается до потери фокуса
    expect(mockOnPhoneChange).not.toHaveBeenCalled();
  });

  it('конвертирует 8 в 7 во время ввода', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    fireEvent.changeText(input, '89001234567');
    expect(input.props.value).toBe('+79001234567');  // 8 → 7

    fireEvent(input, 'endEditing');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('+7 (900) 123-45-67');  // Маска при onEndEditing
  });

  it('добавляет 7 в начало, если пользователь начинает с другой цифры', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Попытка начать с 5 (неправильно)
    fireEvent.changeText(input, '59001234567');
    // Должно быть нормализовано с добавлением 7 в начало
    expect(input.props.value).toBe('+759001234567');  // +7 добавлен
  });

  it('ограничивает максимум 11 цифр', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Пытаемся ввести 12+ цифр
    fireEvent.changeText(input, '79001234567890');
    expect(input.props.value).toBe('+79001234567');  // Обрезано до 11 цифр
  });

  it('удаление номера полностью работает корректно', () => {
    const { getByTestId } = renderPhoneStep({ phone: '+7 (926) 123-45-67' });
    const input = getByTestId('login-phone-input');

    // Пользователь удаляет всё справа налево
    fireEvent.changeText(input, '');
    // Форматирование не применяется при вводе
    expect(mockOnPhoneChange).not.toHaveBeenCalled();

    // При выходе из поля
    fireEvent(input, 'endEditing');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('');
  });

  it('сохраняет локальное состояние при синхронизации с parent', () => {
    const { rerender, getByTestId } = renderPhoneStep({ phone: '' });
    const input = getByTestId('login-phone-input');

    // Вводим цифры
    fireEvent.changeText(input, '79001234567');

    // Перерендерим с новым phone от parent (например, при возврате)
    rerender(
      <PhoneStep
        phone="+7 (900) 123-45-67"
        loading={false}
        onPhoneChange={mockOnPhoneChange}
        onContinue={mockOnContinue}
      />
    );

    // Локальное состояние синхронизировалось
    expect(getByTestId('login-phone-input').props.value).toBe('+7 (900) 123-45-67');
  });
});
