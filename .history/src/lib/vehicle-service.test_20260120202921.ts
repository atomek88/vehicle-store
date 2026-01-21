import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createVehicleService } from './vehicle-service';
import { Vehicle } from '@/types';

describe('VehicleService', () => {
  let service: ReturnType<typeof createVehicleService>;
  let existingVehicles: Vehicle[];

  beforeEach(() => {
    service = createVehicleService();
    existingVehicles = [];
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE VEHICLE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createVehicle', () => {
    describe('sedan creation', () => {
      it('creates sedan with all fields provided', () => {
        const input = {
          type: 'sedan' as const,
          nickname: 'Test Sedan',
          mileage: 50000,
          wheels: 4 as const,
          doors: 4 as const,
          engineStatus: 'works' as const,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.type).toBe('sedan');
          expect(result.value.nickname).toBe('Test Sedan');
          expect(result.value.mileage).toBe(50000);
          expect(result.value.wheels).toBe(4);
          if (result.value.type === 'sedan') {
            expect(result.value.doors).toBe(4);
          }
          expect(result.value.engineStatus).toBe('works');
          expect(result.value.id).toBeDefined();
          expect(result.value.createdAt).toBeDefined();
          expect(result.value.updatedAt).toBeDefined();
          expect(result.value.registration).toBeDefined();
        }
      });

      it('creates sedan with defaults applied', () => {
        const input = {
          type: 'sedan' as const,
          nickname: 'Minimal Sedan',
          mileage: 25000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.wheels).toBe(4); // default
          expect(result.value.doors).toBe(4); // default
          expect(result.value.engineStatus).toBe('works'); // default
        }
      });

      it('registers sedan successfully when mileage is under limit', () => {
        const input = {
          type: 'sedan' as const,
          nickname: 'Low Mileage',
          mileage: 50000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.registration.status === 'registered') {
          expect(result.value.registration.registrationId).toMatch(/^SEDAN-/);
        }
      });

      it('fails registration for sedan with high mileage', () => {
        const input = {
          type: 'sedan' as const,
          nickname: 'High Mileage',
          mileage: 150000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.registration.status === 'failed') {
          expect(result.value.registration.registrationError).toContain('150,000');
        }
      });

      it('trims nickname whitespace', () => {
        const input = {
          type: 'sedan' as const,
          nickname: '  Trimmed  ',
          mileage: 50000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.nickname).toBe('Trimmed');
        }
      });
    });

    describe('coupe creation', () => {
      it('creates coupe with defaults', () => {
        const input = {
          type: 'coupe' as const,
          nickname: 'Sport Coupe',
          mileage: 25000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.type).toBe('coupe');
          expect(result.value.wheels).toBe(4);
          expect(result.value.doors).toBe(2);
        }
      });

      it('registers coupe regardless of mileage', () => {
        const input = {
          type: 'coupe' as const,
          nickname: 'High Mileage Coupe',
          mileage: 200000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.registration.status === 'registered') {
          expect(result.value.registration.registrationId).toMatch(/^COUPE-/);
        }
      });
    });

    describe('mini-van creation', () => {
      it('creates mini-van with default door config', () => {
        const input = {
          type: 'mini-van' as const,
          nickname: 'Family Van',
          mileage: 80000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.type === 'mini-van') {
          expect(result.value.doorConfig).toEqual([
            { sliding: false },
            { sliding: false },
            { sliding: true },
            { sliding: true },
          ]);
        }
      });

      it('creates mini-van with custom door config', () => {
        const input = {
          type: 'mini-van' as const,
          nickname: 'Custom Van',
          mileage: 60000,
          doors: 3 as const,
          doorConfig: [
            { sliding: true },
            { sliding: true },
            { sliding: true },
          ],
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.type === 'mini-van') {
          expect(result.value.doorConfig).toHaveLength(3);
          expect(result.value.doorConfig.every((d) => d.sliding)).toBe(true);
        }
      });
    });

    describe('motorcycle creation', () => {
      it('creates motorcycle with defaults', () => {
        const input = {
          type: 'motorcycle' as const,
          nickname: 'Speed Bike',
          mileage: 10000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.type === 'motorcycle') {
          expect(result.value.wheels).toBe(2);
          expect(result.value.seatStatus).toBe('works');
        }
      });

      it('registers motorcycle successfully when mileage is under limit', () => {
        const input = {
          type: 'motorcycle' as const,
          nickname: 'Low Mileage Bike',
          mileage: 25000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.registration.status === 'registered') {
          expect(result.value.registration.registrationId).toMatch(/^MOTORCYCLE-/);
        }
      });

      it('fails registration for motorcycle with high mileage', () => {
        const input = {
          type: 'motorcycle' as const,
          nickname: 'High Mileage Bike',
          mileage: 75000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
        if (result.ok && result.value.registration.status === 'failed') {
          expect(result.value.registration.registrationError).toContain('75,000');
        }
      });
    });

    describe('nickname uniqueness validation', () => {
      beforeEach(() => {
        existingVehicles = [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: 'sedan',
            nickname: 'Existing Vehicle',
            mileage: 50000,
            wheels: 4,
            doors: 4,
            engineStatus: 'works',
            registration: { status: 'registered', registrationId: 'SEDAN-ABC' },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ];
      });

      it('rejects duplicate nickname (exact match)', () => {
        const input = {
          type: 'coupe' as const,
          nickname: 'Existing Vehicle',
          mileage: 25000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('NICKNAME_TAKEN');
          expect(result.error.message).toContain('Existing Vehicle');
          expect(result.error.fieldErrors?.nickname).toBeDefined();
        }
      });

      it('rejects duplicate nickname (case-insensitive)', () => {
        const input = {
          type: 'coupe' as const,
          nickname: 'EXISTING VEHICLE',
          mileage: 25000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('NICKNAME_TAKEN');
        }
      });

      it('rejects duplicate nickname (with whitespace)', () => {
        const input = {
          type: 'coupe' as const,
          nickname: '  existing vehicle  ',
          mileage: 25000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('NICKNAME_TAKEN');
        }
      });

      it('allows unique nickname', () => {
        const input = {
          type: 'coupe' as const,
          nickname: 'Unique Vehicle',
          mileage: 25000,
        };

        const result = service.createVehicle(input, existingVehicles);

        expect(result.ok).toBe(true);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE VEHICLE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('updateVehicle', () => {
    beforeEach(() => {
      existingVehicles = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Original Sedan',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'SEDAN-ABC' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          type: 'coupe',
          nickname: 'Other Vehicle',
          mileage: 25000,
          wheels: 4,
          doors: 2,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'COUPE-XYZ' },
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ];
    });

    it('updates vehicle successfully', () => {
      const input = {
        type: 'sedan' as const,
        nickname: 'Updated Sedan',
        mileage: 60000,
        wheels: 3 as const,
        doors: 3 as const,
        engineStatus: 'fixable' as const,
      };

      const result = service.updateVehicle('123e4567-e89b-12d3-a456-426614174000', input, existingVehicles);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.nickname).toBe('Updated Sedan');
        expect(result.value.mileage).toBe(60000);
        expect(result.value.wheels).toBe(3);
        expect(result.value.doors).toBe(3);
        expect(result.value.engineStatus).toBe('fixable');
        expect(result.value.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
      }
    });

    it('preserves registration when updating', () => {
      const input = {
        type: 'sedan' as const,
        nickname: 'Updated Sedan',
        mileage: 60000,
      };

      const result = service.updateVehicle('123e4567-e89b-12d3-a456-426614174000', input, existingVehicles);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.registration).toEqual({
          status: 'registered',
          registrationId: 'SEDAN-ABC',
        });
      }
    });

    it('preserves createdAt when updating', () => {
      const input = {
        type: 'sedan' as const,
        nickname: 'Updated Sedan',
        mileage: 60000,
      };

      const result = service.updateVehicle('123e4567-e89b-12d3-a456-426614174000', input, existingVehicles);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.createdAt).toBe('2024-01-01T00:00:00.000Z');
      }
    });

    it('returns error when vehicle not found', () => {
      const input = {
        type: 'sedan' as const,
        nickname: 'Updated',
        mileage: 60000,
      };

      const result = service.updateVehicle('nonexistent-id', input, existingVehicles);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VEHICLE_NOT_FOUND');
        expect(result.error.message).toContain('nonexistent-id');
      }
    });

    it('returns error when trying to change vehicle type', () => {
      const input = {
        type: 'coupe' as const,
        nickname: 'Changed Type',
        mileage: 50000,
      };

      const result = service.updateVehicle('123e4567-e89b-12d3-a456-426614174000', input, existingVehicles);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CANNOT_CHANGE_TYPE');
        expect(result.error.message).toContain('sedan');
        expect(result.error.message).toContain('coupe');
      }
    });

    it('rejects duplicate nickname when updating', () => {
      const input = {
        type: 'sedan' as const,
        nickname: 'Other Vehicle', // Already exists on different vehicle
        mileage: 60000,
      };

      const result = service.updateVehicle('123e4567-e89b-12d3-a456-426614174000', input, existingVehicles);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('NICKNAME_TAKEN');
      }
    });

    it('allows keeping the same nickname', () => {
      const input = {
        type: 'sedan' as const,
        nickname: 'Original Sedan', // Same as current
        mileage: 60000,
      };

      const result = service.updateVehicle('123e4567-e89b-12d3-a456-426614174000', input, existingVehicles);

      expect(result.ok).toBe(true);
    });

    it('allows changing nickname case', () => {
      const input = {
        type: 'sedan' as const,
        nickname: 'ORIGINAL SEDAN', // Same but different case
        mileage: 60000,
      };

      const result = service.updateVehicle('123e4567-e89b-12d3-a456-426614174000', input, existingVehicles);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.nickname).toBe('ORIGINAL SEDAN');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE VEHICLE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deleteVehicle', () => {
    beforeEach(() => {
      existingVehicles = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Vehicle 1',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'SEDAN-ABC' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          type: 'coupe',
          nickname: 'Vehicle 2',
          mileage: 25000,
          wheels: 4,
          doors: 2,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'COUPE-XYZ' },
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ];
    });

    it('deletes vehicle successfully', () => {
      const result = service.deleteVehicle('123e4567-e89b-12d3-a456-426614174000', existingVehicles);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.id).toBe('223e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('returns error when vehicle not found', () => {
      const result = service.deleteVehicle('nonexistent-id', existingVehicles);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VEHICLE_NOT_FOUND');
        expect(result.error.message).toContain('nonexistent-id');
      }
    });

    it('returns empty array when deleting last vehicle', () => {
      const singleVehicle = [existingVehicles[0]!];
      const result = service.deleteVehicle('123e4567-e89b-12d3-a456-426614174000', singleVehicle);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });

    it('does not mutate original array', () => {
      const originalLength = existingVehicles.length;
      service.deleteVehicle('123e4567-e89b-12d3-a456-426614174000', existingVehicles);

      expect(existingVehicles).toHaveLength(originalLength);
    });
  });
});
