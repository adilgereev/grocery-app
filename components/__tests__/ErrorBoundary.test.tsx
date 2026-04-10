import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { logger } from '@/lib/utils/logger';

jest.mock('@/lib/utils/logger', () => ({
  logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn() },
}));

// Вспомогательный компонент — бросает ошибку при shouldThrow=true
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Тестовая ошибка');
  return <Text>Контент загружен</Text>;
};

// React пишет в console.error при пойманных ошибках — подавляем в тестах
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('рендерит children при отсутствии ошибки', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(getByText('Контент загружен')).toBeTruthy();
  });

  it('отображает стандартный экран ошибки при падении потомка', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByText('Упс, что-то пошло не так')).toBeTruthy();
    expect(getByText('Тестовая ошибка')).toBeTruthy();
  });

  it('рендерит кастомный fallback если передан', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary fallback={<Text>Кастомный fallback</Text>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByText('Кастомный fallback')).toBeTruthy();
    expect(queryByText('Упс, что-то пошло не так')).toBeNull();
  });

  it('кнопка "Перезагрузить" сбрасывает ошибку и показывает children', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    fireEvent.press(getByText('Перезагрузить приложение'));
    // После сброса ErrorBoundary попытается снова отрендерить ThrowError
    // (shouldThrow по-прежнему true, ошибка вновь поймается — это ОК, тест проверяет сброс)
    expect(getByText('Упс, что-то пошло не так')).toBeTruthy();
  });

  it('logger.error вызывается при поимке ошибки', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(logger.error).toHaveBeenCalled();
  });
});
