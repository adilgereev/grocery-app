import { formatShortAddress, formatFullAddress } from '../addressFormatter';
import { Address } from '@/types';

describe('addressFormatter', () => {
  const mockAddress: Address = {
    id: '1',
    text: 'ул. Орджоникидзе',
    house: '5',
    apartment: '12',
    entrance: '2',
    floor: '4',
    is_selected: false,
    lat: 42.82,
    lon: 47.11
  };

  const minimalAddress: Address = {
    id: '2',
    text: 'ул. Ленина',
    house: '',
    apartment: '',
    entrance: '',
    floor: '',
    is_selected: false,
    lat: 0,
    lon: 0
  };

  describe('formatShortAddress', () => {
    it('должен возвращать "Выберите адрес", если адрес не передан', () => {
      expect(formatShortAddress(null)).toBe('Выберите адрес');
      expect(formatShortAddress(undefined)).toBe('Выберите адрес');
    });

    it('должен форматировать адрес без города и региона', () => {
      expect(formatShortAddress(mockAddress)).toBe('ул. Орджоникидзе, д. 5');
    });

    it('должен корректно работать с минимальным адресом (только текст)', () => {
      expect(formatShortAddress(minimalAddress)).toBe('ул. Ленина');
    });

    it('должен очищать префиксы города Буйнакск и Республики Дагестан', () => {
      const buynakskAddr: Address = {
        ...mockAddress,
        text: 'г. Буйнакск, ул. Орджоникидзе, Республика Дагестан',
        house: '5'
      };
      expect(formatShortAddress(buynakskAddr)).toBe('ул. Орджоникидзе, д. 5');
    });
  });

  describe('formatFullAddress', () => {
    it('должен возвращать пустую строку, если адрес не передан', () => {
      expect(formatFullAddress(null)).toBe('');
    });

    it('должен форматировать полный адрес со всеми деталями (кв, под, эт)', () => {
      expect(formatFullAddress(mockAddress)).toBe('ул. Орджоникидзе, д. 5, кв. 12, под. 2, эт. 4');
    });

    it('должен пропускать отсутствующие поля (квартира, этаж и т.д.)', () => {
      const partialAddr: Address = { ...minimalAddress, house: '10' };
      expect(formatFullAddress(partialAddr)).toBe('ул. Ленина, д. 10');
    });
  });
});
