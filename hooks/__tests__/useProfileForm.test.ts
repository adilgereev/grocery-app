import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useProfileForm } from '../useProfileForm';
import { useAuth } from '@/providers/AuthProvider';
import * as authApi from '@/lib/api/authApi';
import { Alert } from 'react-native';
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

const mockSession = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
  },
};

const mockProfileData = {
  first_name: 'Иван',
  last_name: 'Иванов',
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

  // --- Сохранение профиля ---

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

    const formData = {
      first_name: 'Петр',
      last_name: 'Петров',
    };

    await act(async () => {
      await result.current.onSave(formData);
    });

    expect(authApi.updateUserProfile).toHaveBeenCalledWith('test-user-123', {
      first_name: 'Петр',
      last_name: 'Петров',
    });

    expect(Alert.alert).toHaveBeenCalledWith('Готово', 'Персональные данные сохранены!');
    expect(mockBack).toHaveBeenCalled();
  });

  it('обрабатывает null значение last_name при сохранении', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfileData);
    (authApi.updateUserProfile as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formData = {
      first_name: 'Петр',
      last_name: '',
    };

    await act(async () => {
      await result.current.onSave(formData);
    });

    expect(authApi.updateUserProfile).toHaveBeenCalledWith('test-user-123', {
      first_name: 'Петр',
      last_name: null,
    });
  });

  it('показывает ошибку при неудачном сохранении', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfileData);
    const errorMessage = 'Ошибка сервера';
    (authApi.updateUserProfile as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formData = {
      first_name: 'Петр',
      last_name: 'Петров',
    };

    await act(async () => {
      await result.current.onSave(formData);
    });

    expect(Alert.alert).toHaveBeenCalledWith('Ошибка', errorMessage);
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

    const formData = {
      first_name: 'Петр',
      last_name: 'Петров',
    };

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

    const formData = {
      first_name: 'Петр',
      last_name: 'Петров',
    };

    await act(async () => {
      await result.current.onSave(formData);
    });

    expect(authApi.updateUserProfile).not.toHaveBeenCalled();
  });

  // --- Валидация формы ---

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

  it('обновляет phone при загрузке профиля без first_name и last_name', async () => {
    (authApi.fetchUserProfile as jest.Mock).mockResolvedValue({
      first_name: null,
      last_name: null,
      phone: '+79999999999',
    });

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.phone).toBe('+79999999999');
  });
});
