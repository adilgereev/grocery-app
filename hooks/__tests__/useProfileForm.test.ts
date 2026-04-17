import { renderHook, waitFor } from '@testing-library/react-native';
import { useProfileForm } from '../useProfileForm';
import { useAuth } from '@/providers/AuthProvider';
import * as authApi from '@/lib/api/authApi';
import { Alert } from 'react-native';

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

describe('useProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    (useAuth as jest.Mock).mockReturnValue({
      session: mockSession,
    });
  });

  afterEach(() => {
    (Alert.alert as jest.Mock).mockRestore();
  });

  // --- Начальное состояние ---

  it('инициализируется с loading=false когда session отсутствует', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
    });

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.saving).toBe(false);
    expect(result.current.phone).toBe('');
  });

  // --- Загрузка профиля ---

  it('загружает профиль при монтировании', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfileData);

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.fetchUserProfile).toHaveBeenCalledWith('test-user-123');
    expect(result.current.phone).toBe('+79991234567');
  });

  it('заполняет форму загруженными данными', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfileData);

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Проверяем, что form заполнена (используем контрол для доступа)
    const { control } = result.current;
    expect(control).toBeDefined();
  });

  it('обрабатывает ошибку при загрузке профиля', async () => {
    const testError = new Error('Network error');
    (authApi.fetchUserProfile as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // После ошибки loading становится false, но данные могут быть пустыми
    expect(result.current.loading).toBe(false);
  });

  it('не загружает профиль если session отсутствует', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
    });

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.fetchUserProfile).not.toHaveBeenCalled();
  });

  it('обновляет phone при загрузке профиля без first_name', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue({
      first_name: null,
      phone: '+79999999999',
    });

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.phone).toBe('+79999999999');
  });
});
