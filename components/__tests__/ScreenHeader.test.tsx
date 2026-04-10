import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import ScreenHeader from '@/components/ui/ScreenHeader';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('ScreenHeader', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  });

  it('отображает title', () => {
    const { getByText } = render(<ScreenHeader title="Мои заказы" />);
    expect(getByText('Мои заказы')).toBeTruthy();
  });

  it('кнопка назад видна по умолчанию (showBackBtn=true)', () => {
    const { getByTestId } = render(<ScreenHeader title="Тест" />);
    expect(getByTestId('header-back-button')).toBeTruthy();
  });

  it('showBackBtn=false скрывает кнопку назад', () => {
    const { queryByTestId } = render(<ScreenHeader title="Тест" showBackBtn={false} />);
    expect(queryByTestId('header-back-button')).toBeNull();
  });

  it('нажатие на back вызывает router.back() по умолчанию', () => {
    const { getByTestId } = render(<ScreenHeader title="Тест" />);
    fireEvent.press(getByTestId('header-back-button'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('нажатие на back вызывает onBackPress если передан', () => {
    const mockOnBackPress = jest.fn();
    const { getByTestId } = render(<ScreenHeader title="Тест" onBackPress={mockOnBackPress} />);
    fireEvent.press(getByTestId('header-back-button'));
    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('rightElement рендерится', () => {
    const { getByText } = render(
      <ScreenHeader title="Тест" rightElement={<Text>Действие</Text>} />
    );
    expect(getByText('Действие')).toBeTruthy();
  });
});
