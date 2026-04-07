import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddressSearchInput from '@/components/address/AddressSearchInput';
import { getAddressSuggestions } from '@/lib/dadataApi';

// Мокаем debounce, чтобы он выполнялся мгновенно
jest.mock('lodash.debounce', () => (fn: any) => {
  fn.cancel = jest.fn();
  return fn;
});

// Мокаем API подсказок
jest.mock('@/lib/dadataApi', () => ({
  getAddressSuggestions: jest.fn(),
}));

const mockSuggestions = [
  {
    value: 'ул. Ленина',
    unrestricted_value: 'г Буйнакск, ул Ленина',
    data: { city: 'Буйнакск', geo_lat: '42', geo_lon: '47' },
  },
  {
    value: 'ул. Ленина, д 10',
    unrestricted_value: 'г Буйнакск, ул Ленина, д 10',
    data: { city: 'Буйнакск', house: '10', geo_lat: '42.1', geo_lon: '47.1' },
  },
];

describe('AddressSearchInput', () => {
  const mockOnSelect = jest.fn();
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial value', () => {
    const { getByDisplayValue } = render(
      <AddressSearchInput onSelect={mockOnSelect} initialValue="ул. Мира" />
    );
    expect(getByDisplayValue('ул. Мира')).toBeTruthy();
  });

  it('fetches and shows suggestions when typing more than 2 characters', async () => {
    (getAddressSuggestions as jest.Mock).mockResolvedValue(mockSuggestions);

    const { getByTestId, findByText } = render(
      <AddressSearchInput onSelect={mockOnSelect} onChangeText={mockOnChangeText} />
    );

    const input = getByTestId('address-search-input');
    
    act(() => {
      fireEvent.changeText(input, 'Лени');
    });

    expect(mockOnChangeText).toHaveBeenCalledWith('Лени');
    
    await waitFor(async () => {
      expect(getAddressSuggestions).toHaveBeenCalledWith('Лени', undefined);
      expect(await findByText('ул. Ленина')).toBeTruthy();
      expect(await findByText('ул. Ленина, д 10')).toBeTruthy();
    });
  });

  it('handles street selection (no house): appends space and keeps searching', async () => {
    (getAddressSuggestions as jest.Mock).mockResolvedValue(mockSuggestions);

    const { getByTestId } = render(
      <AddressSearchInput onSelect={mockOnSelect} onChangeText={mockOnChangeText} />
    );

    const input = getByTestId('address-search-input');
    act(() => {
      fireEvent.changeText(input, 'Лени');
    });

    // Ждем появления подсказок и кликаем по той, где нет дома
    await waitFor(() => {
      fireEvent.press(getByTestId('suggestion-item-г Буйнакск, ул Ленина'));
    });

    expect(input.props.value).toBe('ул. Ленина ');
    expect(mockOnChangeText).toHaveBeenCalledWith('ул. Ленина ');
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('handles house selection: calls onSelect and clears suggestions', async () => {
    (getAddressSuggestions as jest.Mock).mockResolvedValue(mockSuggestions);

    const { getByTestId, queryByTestId } = render(
      <AddressSearchInput onSelect={mockOnSelect} />
    );

    const input = getByTestId('address-search-input');
    act(() => {
      fireEvent.changeText(input, 'Лени');
    });

    // Ждем появления подсказок и кликаем по подсказке с домом
    await waitFor(() => {
        fireEvent.press(getByTestId('suggestion-item-г Буйнакск, ул Ленина, д 10'));
    });

    expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[1]);
    expect(input.props.value).toBe('ул. Ленина, д 10');
    expect(queryByTestId('address-suggestions-scroll')).toBeNull();
  });

  it('clears input when clear button is pressed', async () => {
    const { getByTestId, queryByDisplayValue } = render(
      <AddressSearchInput onSelect={mockOnSelect} initialValue="ул. Мира" />
    );

    act(() => {
        fireEvent.press(getByTestId('address-search-clear'));
    });

    await waitFor(() => {
        expect(queryByDisplayValue('ул. Мира')).toBeNull();
    });
    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
