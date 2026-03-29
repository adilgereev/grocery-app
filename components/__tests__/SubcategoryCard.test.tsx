import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import SubcategoryCard from '../SubcategoryCard';
import { useRouter } from 'expo-router';

// Моки useRouter и Reanimated теперь в jest.setup.js


describe('SubcategoryCard', () => {
  const mockSubcategory = {
    id: 'cat-123',
    name: 'Фрукты и овощи',
    slug: 'fruits-veg',
    image_url: 'https://example.com/image.png',
    parent_id: 'parent-1',
    sort_order: 0,
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
    // 2 items: index 0 -> 60%
    const { getByTestId, rerender } = render(
      <SubcategoryCard subcategory={mockSubcategory} index={0} totalItems={2} />
    );
    let card = getByTestId('subcategory-card');
    let flattenedStyle = StyleSheet.flatten(card.props.style);
    expect(flattenedStyle).toMatchObject({ width: '60%' });

    // 1 item: index 0 -> 100%
    rerender(<SubcategoryCard subcategory={mockSubcategory} index={0} totalItems={1} />);
    card = getByTestId('subcategory-card');
    flattenedStyle = StyleSheet.flatten(card.props.style);
    expect(flattenedStyle).toMatchObject({ width: '100%' });

    // 3 items: index 2 (last of 3) -> 32%
    rerender(<SubcategoryCard subcategory={mockSubcategory} index={2} totalItems={3} />);
    card = getByTestId('subcategory-card');
    flattenedStyle = StyleSheet.flatten(card.props.style);
    expect(flattenedStyle).toMatchObject({ width: '32%' });
  });
});
