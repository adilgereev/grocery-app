import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useProfileForm } from '../useProfileForm';
import { useAuth } from '@/providers/AuthProvider';
import * as authApi from '@/lib/api/authApi';
import { useRouter } from 'expo-router';

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api/authApi', () => ({
  fetchUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: { error: jest.fn(), log: jest.fn() },
}));

jest.mock('@/store/toastStore', () => ({
  useToastStore: { getState: jest.fn() },
}));

import { useToastStore } from '@/store/toastStore';

const mockShowToast = jest.fn();

const mockSession = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
  },
};

const mockProfileData = {
  first_name: 'Иван',
  phone: '+79991234567',
};

/**
 * Часть 2 тестов useProfileForm: сохранение и валидация.
 */
describe('useProfileForm - Save & Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToastStore.getState as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (useAuth as jest.Mock).mockReturnValue({
      session: mockSession,
    });
  });

  it('успешно сохраняет профиль', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfileData);
    (authApi.updateUserProfile as jest.Mock).mockResolvedValue({});
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      back: mockBack,
    });

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formData = { first_name: 'Петр' };

    await act(async () => {
      await result.current.onSave(formData);
    });

    expect(authApi.updateUserProfile).toHaveBeenCalledWith('test-user-123', {
      first_name: 'Петр',
    });

    expect(mockShowToast).toHaveBeenCalledWith('success', 'Персональные данные сохранены!');
    expect(mockBack).toHaveBeenCalled();
  });

  it('показывает ошибку при неудачном сохранении', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfileData);
    const errorMessage = 'Ошибка сервера';
    (authApi.updateUserProfile as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formData = { first_name: 'Петр' };

    await act(async () => {
      await result.current.onSave(formData);
    });

    expect(mockShowToast).toHaveBeenCalledWith('error', errorMessage);
  });

  it('устанавливает saving=true во время сохранения', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfileData);
    (authApi.updateUserProfile as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formData = { first_name: 'Петр' };

    act(() => {
      result.current.onSave(formData);
    });

    expect(result.current.saving).toBe(true);

    await waitFor(() => {
      expect(result.current.saving).toBe(false);
    });
  });

  it('не сохраняет если session отсутствует', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
    });

    const { result } = renderHook(() => useProfileForm());

    const formData = { first_name: 'Петр' };

    await act(async () => {
      await result.current.onSave(formData);
    });

    expect(authApi.updateUserProfile).not.toHaveBeenCalled();
  });

  it('возвращает объект с необходимыми полями', () => {
    const { result } = renderHook(() => useProfileForm());

    expect(result.current.control).toBeDefined();
    expect(result.current.errors).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.saving).toBeDefined();
    expect(result.current.phone).toBeDefined();
    expect(result.current.onSave).toBeDefined();
  });
});
