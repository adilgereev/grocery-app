import { getMosaicCardWidth } from '../mosaicLayout';

describe('getMosaicCardWidth', () => {
  it('should return 100% for a single item list', () => {
    expect(getMosaicCardWidth(0, 1)).toBe('100%');
  });

  describe('Even number of items (totalItems is even)', () => {
    it('should alternate 60% and 37% for the first row', () => {
      // Row 0
      expect(getMosaicCardWidth(0, 4)).toBe('60%');
      expect(getMosaicCardWidth(1, 4)).toBe('37%');
    });

    it('should alternate 37% and 60% for the second row', () => {
      // Row 1
      expect(getMosaicCardWidth(2, 4)).toBe('37%');
      expect(getMosaicCardWidth(3, 4)).toBe('60%');
    });

    it('should alternate 60% and 37% for the third row', () => {
      // Row 2
      expect(getMosaicCardWidth(4, 6)).toBe('60%');
      expect(getMosaicCardWidth(5, 6)).toBe('37%');
    });
  });

  describe('Odd number of items algorithm (totalItems >= 3)', () => {
    it('should apply 32% to the last 3 items for a 3-item list', () => {
      expect(getMosaicCardWidth(0, 3)).toBe('32%');
      expect(getMosaicCardWidth(1, 3)).toBe('32%');
      expect(getMosaicCardWidth(2, 3)).toBe('32%');
    });

    it('should apply 32% to the last 3 items for a 5-item list, leaving first 2 intact', () => {
      // First row (normal)
      expect(getMosaicCardWidth(0, 5)).toBe('60%');
      expect(getMosaicCardWidth(1, 5)).toBe('37%');
      
      // Last 3 items (orphans)
      expect(getMosaicCardWidth(2, 5)).toBe('32%');
      expect(getMosaicCardWidth(3, 5)).toBe('32%');
      expect(getMosaicCardWidth(4, 5)).toBe('32%');
    });
    
    it('should apply 32% to the last 3 items for a 7-item list', () => {
      // First row
      expect(getMosaicCardWidth(0, 7)).toBe('60%');
      expect(getMosaicCardWidth(1, 7)).toBe('37%');

      // Second row
      expect(getMosaicCardWidth(2, 7)).toBe('37%');
      expect(getMosaicCardWidth(3, 7)).toBe('60%');
      
      // Last 3 items
      expect(getMosaicCardWidth(4, 7)).toBe('32%');
      expect(getMosaicCardWidth(5, 7)).toBe('32%');
      expect(getMosaicCardWidth(6, 7)).toBe('32%');
    });
  });
});
