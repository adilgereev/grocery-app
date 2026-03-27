import { formatShortAddress, formatFullAddress } from './addressFormatter';
import { Address } from '@/store/addressStore';

describe('addressFormatter', () => {
  const mockAddress: Address = {
    id: '1',
    text: 'г. Буйнакск, ул. Орджоникидзе, Республика Дагестан',
    house: '5',
    entrance: '2',
    floor: '4',
    apartment: '12',
    is_selected: true,
  };

  describe('formatShortAddress', () => {
    it('returns default message when address is null', () => {
      expect(formatShortAddress(null)).toBe('Выберите адрес');
    });

    it('returns formatted short address with cleaned street and house', () => {
      expect(formatShortAddress(mockAddress)).toBe('ул. Орджоникидзе, д. 5');
    });

    it('returns only street if house is missing', () => {
      const addrWithoutHouse = { ...mockAddress, house: undefined };
      expect(formatShortAddress(addrWithoutHouse)).toBe('ул. Орджоникидзе');
    });
  });

  describe('formatFullAddress', () => {
    it('returns empty string when address is null', () => {
      expect(formatFullAddress(null)).toBe('');
    });

    it('returns complete formatted address with all details', () => {
      const expected = 'ул. Орджоникидзе, д. 5, кв. 12, под. 2, эт. 4';
      expect(formatFullAddress(mockAddress)).toBe(expected);
    });

    it('handles missing optional fields correctly', () => {
      const partialAddr: Address = {
        id: '2',
        text: 'ул. Ленина',
        house: '10',
        is_selected: false,
      };
      expect(formatFullAddress(partialAddr)).toBe('ул. Ленина, д. 10');
    });
  });
});
