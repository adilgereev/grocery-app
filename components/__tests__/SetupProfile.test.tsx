import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SetupProfileScreen from '@/app/(profile)/setup-profile';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/services/supabase';

// Мокаем AuthProvider
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Мокаем logger
jest.mock('@/lib/utils/logger', () => ({
  logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn() },
}));

// Мокаем SafeAreaView (передаёт children как есть)
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Мокаем KeyboardAwareScrollView
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: ({ children }: { children: React.ReactNode }) => children,
}));

const mockRefreshProfile = jest.fn();

const mockSession = {
  user: {
    id: 'user-123',
    user_metadata: { phone: '+79991234567' },
    phone: '+79991234567',
  },
  access_token: 'token',
};

describe('SetupProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      session: mockSession,
      refreshProfile: mockRefreshProfile,
    });
  });

  it('отображает заголовок и поля ввода', () => {
    const { getByText, getByTestId } = render(<SetupProfileScreen />);

    expect(getByText('Как вас зовут?')).toBeTruthy();
    expect(getByText('Представьтесь, чтобы мы могли обращаться к вам по имени')).toBeTruthy();
    expect(getByTestId('setup-firstname-input')).toBeTruthy();
    expect(getByTestId('setup-continue-button')).toBeTruthy();
  });

  it('показывает ошибку при вводе имени короче 2 символов', async () => {
    const { getByTestId, getByText } = render(<SetupProfileScreen />);

    const input = getByTestId('setup-firstname-input');
    fireEvent.changeText(input, 'А');

    // Нажимаем кнопку для триггера валидации
    fireEvent.press(getByTestId('setup-continue-button'));

    await waitFor(() => {
      expect(getByText('Имя должно быть не короче 2 символов')).toBeTruthy();
    });
  });

  it('успешно сохраняет профиль и вызывает refreshProfile', async () => {
    // Мокаем успешный upsert
    const mockUpsert = jest.fn().mockReturnValue({
      data: null,
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    // Мокаем refreshProfile
    mockRefreshProfile.mockResolvedValue(undefined);

    const { getByTestId } = render(<SetupProfileScreen />);

    // Заполняем форму (согласие — clickwrap на экране телефона)
    fireEvent.changeText(getByTestId('setup-firstname-input'), 'Иван');

    // Нажимаем «Продолжить»
    await act(async () => {
      fireEvent.press(getByTestId('setup-continue-button'));
    });

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          first_name: 'Иван',
          phone: '+79991234567',
          terms_version: '2026-04-18',
        })
      );
      expect(mockRefreshProfile).toHaveBeenCalledTimes(1);
    });
  });

  it('показывает ошибку при неудачном сохранении', async () => {
    const mockUpsert = jest.fn().mockReturnValue({
      data: null,
      error: { message: 'Network error' },
    });
    (supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

    const { getByTestId, getByText } = render(<SetupProfileScreen />);

    fireEvent.changeText(getByTestId('setup-firstname-input'), 'Иван');

    await act(async () => {
      fireEvent.press(getByTestId('setup-continue-button'));
    });

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });

});

