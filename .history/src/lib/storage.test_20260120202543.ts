import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStorageRepository } from './storage';
import { Vehicle } from '@/types';

describe('StorageRepository', () => {
  let repository: ReturnType<typeof createStorageRepository>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    repository = createStorageRepository();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('save', () => {
    it('saves valid vehicles to localStorage', () => {
      const vehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Test Sedan',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: {
            status: 'registered',
            registrationId: 'SEDAN-ABC12',
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const result = repository.save(vehicles);

      expect(result.ok).toBe(true);
      expect(localStorage.getItem('junkyard-tracker-v1')).toBeTruthy();
    });

    it('saves empty array successfully', () => {
      const result = repository.save([]);

      expect(result.ok).toBe(true);
      const stored = localStorage.getItem('junkyard-tracker-v1');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual({
        version: 1,
        vehicles: [],
      });
    });

    it('saves multiple vehicles of different types', () => {
      const vehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Sedan',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'SEDAN-1' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          type: 'motorcycle',
          nickname: 'Bike',
          mileage: 10000,
          wheels: 2,
          seatStatus: 'works',
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'MOTO-1' },
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ];

      const result = repository.save(vehicles);

      expect(result.ok).toBe(true);
    });

    it('rejects invalid vehicle data', () => {
      const invalidVehicles = [
        {
          type: 'sedan',
          nickname: 'Invalid',
          mileage: 50000,
          // Missing required fields: id, wheels, doors, engineStatus, registration, timestamps
        },
      ] as Vehicle[];

      const result = repository.save(invalidVehicles);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('Invalid vehicle data');
      }
    });

    it('rejects vehicle with invalid UUID', () => {
      const vehicles: Vehicle[] = [
        {
          id: 'not-a-uuid',
          type: 'sedan',
          nickname: 'Test',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'TEST-1' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        } as Vehicle,
      ];

      const result = repository.save(vehicles);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('handles localStorage quota exceeded error', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const vehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Test',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'TEST-1' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const result = repository.save(vehicles);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('STORAGE_ERROR');
        expect(result.error.message).toContain('QuotaExceededError');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('load', () => {
    it('returns empty array when no data exists', () => {
      const result = repository.load();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('loads valid vehicles from localStorage', () => {
      const vehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Test Sedan',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'SEDAN-1' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      repository.save(vehicles);
      const result = repository.load();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(vehicles);
      }
    });

    it('loads multiple vehicles correctly', () => {
      const vehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'coupe',
          nickname: 'Coupe',
          mileage: 25000,
          wheels: 4,
          doors: 2,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'COUPE-1' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          type: 'mini-van',
          nickname: 'Van',
          mileage: 80000,
          wheels: 4,
          doors: 4,
          doorConfig: [
            { sliding: false },
            { sliding: false },
            { sliding: true },
            { sliding: true },
          ],
          engineStatus: 'fixable',
          registration: { status: 'failed', registrationError: 'High mileage' },
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ];

      repository.save(vehicles);
      const result = repository.load();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value).toEqual(vehicles);
      }
    });

    it('handles corrupted JSON gracefully', () => {
      localStorage.setItem('junkyard-tracker-v1', 'invalid-json{]');

      const result = repository.load();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
      // Should clear corrupted data
      expect(localStorage.getItem('junkyard-tracker-v1')).toBeNull();
    });

    it('handles invalid schema gracefully', () => {
      localStorage.setItem(
        'junkyard-tracker-v1',
        JSON.stringify({
          version: 999, // Invalid version
          vehicles: [],
        })
      );

      const result = repository.load();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
      // Should clear invalid data
      expect(localStorage.getItem('junkyard-tracker-v1')).toBeNull();
    });

    it('handles invalid vehicle data in storage', () => {
      localStorage.setItem(
        'junkyard-tracker-v1',
        JSON.stringify({
          version: 1,
          vehicles: [
            {
              id: 'invalid-uuid',
              type: 'sedan',
              nickname: 'Test',
              // Missing required fields
            },
          ],
        })
      );

      const result = repository.load();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
      // Should clear invalid data
      expect(localStorage.getItem('junkyard-tracker-v1')).toBeNull();
    });

    it('handles localStorage.getItem error', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = repository.load();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('STORAGE_ERROR');
        expect(result.error.message).toContain('Storage access denied');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('clear', () => {
    it('removes data from localStorage', () => {
      const vehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Test',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'TEST-1' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      repository.save(vehicles);
      expect(localStorage.getItem('junkyard-tracker-v1')).toBeTruthy();

      repository.clear();
      expect(localStorage.getItem('junkyard-tracker-v1')).toBeNull();
    });

    it('does not throw when clearing empty storage', () => {
      expect(() => repository.clear()).not.toThrow();
      expect(localStorage.getItem('junkyard-tracker-v1')).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROUND-TRIP TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('save and load round-trip', () => {
    it('preserves all vehicle data through save/load cycle', () => {
      const vehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'motorcycle',
          nickname: 'Speed Demon',
          mileage: 5000,
          wheels: 2,
          seatStatus: 'fixable',
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'MOTO-XYZ' },
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T15:45:00.000Z',
        },
      ];

      const saveResult = repository.save(vehicles);
      expect(saveResult.ok).toBe(true);

      const loadResult = repository.load();
      expect(loadResult.ok).toBe(true);

      if (loadResult.ok) {
        expect(loadResult.value).toEqual(vehicles);
        expect(loadResult.value[0]?.createdAt).toBe('2024-01-15T10:30:00.000Z');
        expect(loadResult.value[0]?.updatedAt).toBe('2024-01-20T15:45:00.000Z');
      }
    });
  });
});
