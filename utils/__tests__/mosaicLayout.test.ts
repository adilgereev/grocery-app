import { getMosaicCardWidth } from '../mosaicLayout';

describe('getMosaicCardWidth', () => {
  const CW = 316; // Container Width (для тестов: 316 - 16 зазоров = 300 / 3 = 100 unit width)
  const GAP = 8;
  const UNIT = 100;
  const WIDE = 208; // 100 * 2 + 8

  it('should return containerWidth for a single item list', () => {
    expect(getMosaicCardWidth(0, 1, CW, GAP)).toBe(CW);
  });

  describe('Even number of items (totalItems is even)', () => {
    it('should alternate Wide and Unit for the first row', () => {
      // Row 0
      expect(getMosaicCardWidth(0, 4, CW, GAP)).toBeCloseTo(WIDE);
      expect(getMosaicCardWidth(1, 4, CW, GAP)).toBeCloseTo(UNIT);
    });

    it('should alternate Unit and Wide for the second row', () => {
      // Row 1
      expect(getMosaicCardWidth(2, 4, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(3, 4, CW, GAP)).toBeCloseTo(WIDE);
    });

    it('should alternate Wide and Unit for the third row', () => {
      // Row 2
      expect(getMosaicCardWidth(4, 6, CW, GAP)).toBeCloseTo(WIDE);
      expect(getMosaicCardWidth(5, 6, CW, GAP)).toBeCloseTo(UNIT);
    });
  });

  describe('Odd number of items algorithm (totalItems >= 3)', () => {
    it('should apply unit width to the last 3 items for a 3-item list', () => {
      expect(getMosaicCardWidth(0, 3, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(1, 3, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(2, 3, CW, GAP)).toBeCloseTo(UNIT);
    });

    it('should apply unit width to the last 3 items for a 5-item list, leaving first 2 intact', () => {
      // First row (normal)
      expect(getMosaicCardWidth(0, 5, CW, GAP)).toBeCloseTo(WIDE);
      expect(getMosaicCardWidth(1, 5, CW, GAP)).toBeCloseTo(UNIT);
      
      // Last 3 items (orphans)
      expect(getMosaicCardWidth(2, 5, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(3, 5, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(4, 5, CW, GAP)).toBeCloseTo(UNIT);
    });
    
    it('should apply unit width to the last 3 items for a 7-item list', () => {
      // First row
      expect(getMosaicCardWidth(0, 7, CW, GAP)).toBeCloseTo(WIDE);
      expect(getMosaicCardWidth(1, 7, CW, GAP)).toBeCloseTo(UNIT);

      // Second row
      expect(getMosaicCardWidth(2, 7, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(3, 7, CW, GAP)).toBeCloseTo(WIDE);
      
      // Last 3 items
      expect(getMosaicCardWidth(4, 7, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(5, 7, CW, GAP)).toBeCloseTo(UNIT);
      expect(getMosaicCardWidth(6, 7, CW, GAP)).toBeCloseTo(UNIT);
    });
  });
});
