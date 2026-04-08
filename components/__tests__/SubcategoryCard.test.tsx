import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import SubcategoryCard from '@/components/category/SubcategoryCard';

describe('SubcategoryCard', () => {
  const mockSubcategory = {
    id: 'cat-123',
    name: 'Фрукты и овощи',
    slug: 'fruits-veg',
    image_url: 'https://example.com/image.png',
    parent_id: 'parent-1',
    sort_order: 0,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders subcategory name correctly', () => {
    const { getByText } = render(
      <SubcategoryCard subcategory={mockSubcategory} index={0} cardWidth={100} onPress={mockOnPress} />
    );

    expect(getByText('Фрукты и овощи')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <SubcategoryCard subcategory={mockSubcategory} index={0} cardWidth={100} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Фрукты и овощи'));

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('applies correct width from props', () => {
    const { getByTestId, rerender } = render(
      <SubcategoryCard subcategory={mockSubcategory} index={0} cardWidth={208} onPress={mockOnPress} />
    );
    let card = getByTestId('subcategory-card');
    let flattenedStyle = StyleSheet.flatten(card.props.style);
    expect(flattenedStyle).toMatchObject({ width: 208 });

    rerender(<SubcategoryCard subcategory={mockSubcategory} index={0} cardWidth={100} onPress={mockOnPress} />);
    card = getByTestId('subcategory-card');
    flattenedStyle = StyleSheet.flatten(card.props.style);
    expect(flattenedStyle).toMatchObject({ width: 100 });
  });
});
