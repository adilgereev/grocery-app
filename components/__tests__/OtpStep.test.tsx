import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OtpStep } from '@/components/auth/OtpStep';

describe('OtpStep', () => {
  const mockSetOtp = jest.fn();
  const mockOnVerify = jest.fn();
  const mockOnResend = jest.fn();
  const mockOnChangeNumber = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const defaultProps = {
    phone: '+7 (900) 123-45-67',
    loading: false,
    countdown: 0,
    otp: ['', '', '', ''],
    setOtp: mockSetOtp,
    onVerify: mockOnVerify,
    onResend: mockOnResend,
    onChangeNumber: mockOnChangeNumber,
  };

  it('рендерит 4 поля ввода OTP', () => {
    const { getByTestId } = render(<OtpStep {...defaultProps} />);
    expect(getByTestId('otp-input-0')).toBeTruthy();
    expect(getByTestId('otp-input-1')).toBeTruthy();
    expect(getByTestId('otp-input-2')).toBeTruthy();
    expect(getByTestId('otp-input-3')).toBeTruthy();
  });

  it('ввод 4 цифр сразу вызывает onVerify с полным кодом', () => {
    const { getByTestId } = render(<OtpStep {...defaultProps} />);
    fireEvent.changeText(getByTestId('otp-input-0'), '1234');
    expect(mockOnVerify).toHaveBeenCalledWith('1234');
  });

  it('кнопка "Сменить номер" вызывает onChangeNumber', () => {
    const { getByTestId } = render(<OtpStep {...defaultProps} />);
    fireEvent.press(getByTestId('otp-change-number'));
    expect(mockOnChangeNumber).toHaveBeenCalledTimes(1);
  });

  it('countdown=0 — кнопка повтора активна и вызывает onResend', () => {
    const { getByTestId } = render(<OtpStep {...defaultProps} countdown={0} />);
    fireEvent.press(getByTestId('otp-resend-button'));
    expect(mockOnResend).toHaveBeenCalledTimes(1);
  });

  it('countdown>0 — кнопка повтора заблокирована', () => {
    const { getByTestId } = render(<OtpStep {...defaultProps} countdown={30} />);
    fireEvent.press(getByTestId('otp-resend-button'));
    expect(mockOnResend).not.toHaveBeenCalled();
  });

  it('countdown>0 — отображает обратный отсчёт', () => {
    const { getByText } = render(<OtpStep {...defaultProps} countdown={15} />);
    expect(getByText('Повтор через 15с')).toBeTruthy();
  });

  it('loading=true — отображает индикатор загрузки', () => {
    const { getByTestId } = render(<OtpStep {...defaultProps} loading={true} />);
    expect(getByTestId('otp-loader')).toBeTruthy();
  });
});
