import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_ENGINE_STATUS, 
  DEFAULT_SEAT_STATUS, 
  getDefaultWheels, 
  getDefaultDoors, 
  getDefaultDoorConfig 
} from './defaults';

describe('defaults', () => {
  describe('DEFAULT_ENGINE_STATUS', () => {
    it('is "works"', () => {
      expect(DEFAULT_ENGINE_STATUS).toBe('works');
    });
  });

  describe('DEFAULT_SEAT_STATUS', () => {
    it('is "works"', () => {
      expect(DEFAULT_SEAT_STATUS).toBe('works');
    });
  });

  describe('getDefaultWheels', () => {
    it('returns 4 for sedan', () => {
      expect(getDefaultWheels('sedan')).toBe(4);
    });

    it('returns 4 for coupe', () => {
      expect(getDefaultWheels('coupe')).toBe(4);
    });

    it('returns 4 for mini-van', () => {
      expect(getDefaultWheels('mini-van')).toBe(4);
    });

    it('returns 2 for motorcycle', () => {
      expect(getDefaultWheels('motorcycle')).toBe(2);
    });
  });

  describe('getDefaultDoors', () => {
    it('returns 4 for sedan', () => {
      expect(getDefaultDoors('sedan')).toBe(4);
    });

    it('returns 2 for coupe', () => {
      expect(getDefaultDoors('coupe')).toBe(2);
    });

    it('returns 4 for mini-van', () => {
      expect(getDefaultDoors('mini-van')).toBe(4);
    });

    it('returns 0 for motorcycle', () => {
      expect(getDefaultDoors('motorcycle')).toBe(0);
    });
  });

  describe('getDefaultDoorConfig', () => {
    it('returns empty array for 0 doors', () => {
      expect(getDefaultDoorConfig(0)).toEqual([]);
    });

    it('returns correct config for 2 doors (both regular)', () => {
      expect(getDefaultDoorConfig(2)).toEqual([
        { sliding: false },
        { sliding: false },
      ]);
    });

    it('returns correct config for 4 doors (first 2 regular, last 2 sliding)', () => {
      expect(getDefaultDoorConfig(4)).toEqual([
        { sliding: false },
        { sliding: false },
        { sliding: true },
        { sliding: true },
      ]);
    });

    it('returns correct config for 3 doors', () => {
      expect(getDefaultDoorConfig(3)).toEqual([
        { sliding: false },
        { sliding: false },
        { sliding: true },
      ]);
    });

    it('returns correct config for 1 door', () => {
      expect(getDefaultDoorConfig(1)).toEqual([
        { sliding: false },
      ]);
    });
  });
});
