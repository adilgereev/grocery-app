import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import SubcategoryCard from './SubcategoryCard';
import { useRouter } from 'expo-router';

// Мокаем expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Мокаем Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = jest.requireActual('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('SubcategoryCard', () => {
  const mockSubcategory = {
    id: 'cat-123',
    name: 'Фрукты и овощи',
    slug: 'fruits-veg',
    image_url: 'https://example.com/image.png',
    parent_id: 'parent-1',
  };

  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders subcategory name correctly', () => {
    const { getByText } = render(
      <SubcategoryCard subcategory={mockSubcategory} index={0} totalItems={2} />
    );
    
    expect(getByText('Фрукты и овощи')).toBeTruthy();
  });

  it('calls router.push with correct path when pressed', () => {
    const { getByText } = render(
      <SubcategoryCard subcategory={mockSubcategory} index={0} totalItems={2} />
    );
    
    const card = getByText('Фрукты и овощи');
    fireEvent.press(card);
    
    expect(mockPush).toHaveBeenCalledWith('/category/cat-123?name=%D0%A4%D1%80%D1%83%D0%BA%D1%82%D1%8B%20%D0%B8%20%D0%BE%D0%B2%D0%BE%D1%89%D0%B8');
  });

  it('applies correct width based on pattern index', () => {
    const { getByTestId } = render(
      <SubcategoryCard subcategory={mockSubcategory} index={0} totalItems={2} />
    );
    
    // index 0 -> rowIndex 0 -> width 60%
    const card = getByTestId('subcategory-card');
    const flattenedStyle = StyleSheet.flatten(card.props.style);
    expect(flattenedStyle).toMatchObject({ width: '60%' });
  });
});
