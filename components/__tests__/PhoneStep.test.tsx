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

  it('форматирует маску с кодом оператора во время ввода', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Вводим цифры - маска применяется сразу
    fireEvent.changeText(input, '79001234567');
    // Ожидаем форматированный номер с скобками и дефисами
    expect(input.props.value).toBe('+7 (900) 123-45-67');
  });

  it('конвертирует ввод начинающийся на 8 в +7', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    fireEvent.changeText(input, '89001234567');
    expect(input.props.value).toBe('+7 (900) 123-45-67');
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

  it('добавляет 7 в начало, если пользователь начинает с другой цифры', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Попытка начать с 5 (неправильно)
    fireEvent.changeText(input, '59001234567');
    // Должно быть нормализовано с добавлением 7 в начало и полной маской
    expect(input.props.value).toBe('+7 (590) 012-34-56');
  });

  it('ограничивает максимум 11 цифр', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Пытаемся ввести 12+ цифр
    fireEvent.changeText(input, '79001234567890');
    expect(input.props.value).toBe('+7 (900) 123-45-67');  // Обрезано до 11 цифр с маской
  });

  it('удаление номера полностью работает корректно', () => {
    const { getByTestId } = renderPhoneStep({ phone: '+7 (926) 123-45-67' });
    const input = getByTestId('login-phone-input');

    // Пользователь удаляет всё справа налево
    fireEvent.changeText(input, '');
    expect(input.props.value).toBe('');

    // При выходе из поля отправляем в parent
    fireEvent(input, 'endEditing');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('');
  });

  it('отправляет форматированный номер при вводе', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    fireEvent.changeText(input, '79001234567');
    // Теперь onPhoneChange вызывается сразу при вводе, не дожидаясь потери фокуса
    // Это необходимо, чтобы parent component мог проверить валидность при нажатии кнопки
    expect(mockOnPhoneChange).toHaveBeenCalledWith('+7 (900) 123-45-67');
  });

  it('показывает маску во время ввода (на каждом шаге)', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    fireEvent.changeText(input, '7');
    expect(input.props.value).toBe('+7');

    fireEvent.changeText(input, '79');
    expect(input.props.value).toBe('+7 (9');

    fireEvent.changeText(input, '790');
    expect(input.props.value).toBe('+7 (90');

    fireEvent.changeText(input, '7900');
    expect(input.props.value).toBe('+7 (900)');

    fireEvent.changeText(input, '79001');
    expect(input.props.value).toBe('+7 (900) 1');
  });

  it('удаляет цифру при стирании форматного символа (скобка)', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Вводим 4 цифры: 7926
    fireEvent.changeText(input, '7926');
    expect(input.props.value).toBe('+7 (926)');

    // Пользователь видит "+7 (926)" и нажимает backspace на ")"
    // TextInput передает текст без ")": "+7 (926"
    fireEvent.changeText(input, '+7 (926');
    fireEvent(input, 'selectionChange', { nativeEvent: { selection: { start: 7, end: 7 } } });
    // Должна удалиться цифра 6 перед скобкой
    expect(input.props.value).toBe('+7 (92');
  });

  it('простое удаление форматного символа (скобка)', () => {
    const { getByTestId } = renderPhoneStep();
    const input = getByTestId('login-phone-input');

    // Вводим 4 цифры: 7926
    fireEvent.changeText(input, '7926');
    expect(input.props.value).toBe('+7 (926)');

    // Пользователь видит "+7 (926)" и нажимает backspace на ")"
    // TextInput передает текст без ")": "+7 (926" (4 цифры, нет скобки)
    fireEvent.changeText(input, '+7 (926');
    fireEvent(input, 'selectionChange', { nativeEvent: { selection: { start: 7, end: 7 } } });
    // Должна удалиться цифра 6, остается '792'
    expect(input.props.value).toBe('+7 (92');
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

  it('показывает кнопку очистки при наличии текста', () => {
    const { getByTestId, queryByTestId } = renderPhoneStep();
    expect(queryByTestId('login-phone-clear')).toBeNull();

    fireEvent.changeText(getByTestId('login-phone-input'), '79001234567');
    expect(getByTestId('login-phone-clear')).toBeTruthy();
  });

  it('кнопка очистки сбрасывает поле и вызывает onPhoneChange("")', () => {
    const { getByTestId, queryByTestId } = renderPhoneStep();
    fireEvent.changeText(getByTestId('login-phone-input'), '79001234567');
    fireEvent.press(getByTestId('login-phone-clear'));

    expect(getByTestId('login-phone-input').props.value).toBe('');
    expect(mockOnPhoneChange).toHaveBeenCalledWith('');
    expect(queryByTestId('login-phone-clear')).toBeNull();
  });
});
