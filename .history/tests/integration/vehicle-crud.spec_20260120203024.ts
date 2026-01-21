import { describe, it, expect, beforeEach } from 'vitest';
import { createVehicleService } from '@/lib/vehicle-service';
import { createStorageRepository } from '@/lib/storage';
import { Vehicle } from '@/types';

describe('Vehicle CRUD Integration', () => {
  let service: ReturnType<typeof createVehicleService>;
  let storage: ReturnType<typeof createStorageRepository>;

  beforeEach(() => {
    localStorage.clear();
    service = createVehicleService();
    storage = createStorageRepository();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL CRUD FLOW TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('complete CRUD flow', () => {
    it('creates, saves, loads, updates, and deletes a vehicle', () => {
      // 1. CREATE
      const createInput = {
        type: 'sedan' as const,
        nickname: 'Test Sedan',
        mileage: 50000,
      };

      const createResult = service.createVehicle(createInput, []);
      expect(createResult.ok).toBe(true);
      if (!createResult.ok) return;

      const createdVehicle = createResult.value;
      let vehicles = [createdVehicle];

      // 2. SAVE to storage
      const saveResult = storage.save(vehicles);
      expect(saveResult.ok).toBe(true);

      // 3. LOAD from storage
      const loadResult = storage.load();
      expect(loadResult.ok).toBe(true);
      if (!loadResult.ok) return;

      expect(loadResult.value).toHaveLength(1);
      expect(loadResult.value[0]?.nickname).toBe('Test Sedan');

      // 4. UPDATE
      const updateInput = {
        type: 'sedan' as const,
        nickname: 'Updated Sedan',
        mileage: 60000,
      };

      const updateResult = service.updateVehicle(createdVehicle.id, updateInput, loadResult.value);
      expect(updateResult.ok).toBe(true);
      if (!updateResult.ok) return;

      vehicles = loadResult.value.map((v) =>
        v.id === createdVehicle.id ? updateResult.value : v
      );

      // 5. SAVE updated data
      const saveUpdatedResult = storage.save(vehicles);
      expect(saveUpdatedResult.ok).toBe(true);

      // 6. LOAD and verify update
      const loadUpdatedResult = storage.load();
      expect(loadUpdatedResult.ok).toBe(true);
      if (!loadUpdatedResult.ok) return;

      expect(loadUpdatedResult.value[0]?.nickname).toBe('Updated Sedan');
      expect(loadUpdatedResult.value[0]?.mileage).toBe(60000);

      // 7. DELETE
      const deleteResult = service.deleteVehicle(createdVehicle.id, loadUpdatedResult.value);
      expect(deleteResult.ok).toBe(true);
      if (!deleteResult.ok) return;

      expect(deleteResult.value).toHaveLength(0);

      // 8. SAVE empty state
      const saveFinalResult = storage.save(deleteResult.value);
      expect(saveFinalResult.ok).toBe(true);

      // 9. LOAD and verify deletion
      const loadFinalResult = storage.load();
      expect(loadFinalResult.ok).toBe(true);
      if (!loadFinalResult.ok) return;

      expect(loadFinalResult.value).toHaveLength(0);
    });

    it('handles multiple vehicles through full CRUD cycle', () => {
      // Create multiple vehicles
      const sedan = service.createVehicle(
        { type: 'sedan', nickname: 'Sedan', mileage: 50000 },
        []
      );
      expect(sedan.ok).toBe(true);
      if (!sedan.ok) return;

      const coupe = service.createVehicle(
        { type: 'coupe', nickname: 'Coupe', mileage: 25000 },
        [sedan.value]
      );
      expect(coupe.ok).toBe(true);
      if (!coupe.ok) return;

      const motorcycle = service.createVehicle(
        { type: 'motorcycle', nickname: 'Bike', mileage: 10000 },
        [sedan.value, coupe.value]
      );
      expect(motorcycle.ok).toBe(true);
      if (!motorcycle.ok) return;

      let vehicles = [sedan.value, coupe.value, motorcycle.value];

      // Save all
      const saveResult = storage.save(vehicles);
      expect(saveResult.ok).toBe(true);

      // Load all
      const loadResult = storage.load();
      expect(loadResult.ok).toBe(true);
      if (!loadResult.ok) return;

      expect(loadResult.value).toHaveLength(3);

      // Update one
      const updateResult = service.updateVehicle(
        coupe.value.id,
        { type: 'coupe', nickname: 'Updated Coupe', mileage: 30000 },
        loadResult.value
      );
      expect(updateResult.ok).toBe(true);
      if (!updateResult.ok) return;

      vehicles = loadResult.value.map((v) =>
        v.id === coupe.value.id ? updateResult.value : v
      );

      // Delete one
      const deleteResult = service.deleteVehicle(sedan.value.id, vehicles);
      expect(deleteResult.ok).toBe(true);
      if (!deleteResult.ok) return;

      expect(deleteResult.value).toHaveLength(2);

      // Save final state
      storage.save(deleteResult.value);

      // Load and verify
      const finalLoad = storage.load();
      expect(finalLoad.ok).toBe(true);
      if (!finalLoad.ok) return;

      expect(finalLoad.value).toHaveLength(2);
      expect(finalLoad.value.find((v) => v.nickname === 'Updated Coupe')).toBeDefined();
      expect(finalLoad.value.find((v) => v.nickname === 'Bike')).toBeDefined();
      expect(finalLoad.value.find((v) => v.nickname === 'Sedan')).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS RULE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('nickname uniqueness across storage', () => {
    it('prevents duplicate nicknames when creating new vehicles', () => {
      // Create first vehicle
      const first = service.createVehicle(
        { type: 'sedan', nickname: 'Unique Name', mileage: 50000 },
        []
      );
      expect(first.ok).toBe(true);
      if (!first.ok) return;

      storage.save([first.value]);

      // Load from storage
      const loaded = storage.load();
      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;

      // Try to create duplicate
      const duplicate = service.createVehicle(
        { type: 'coupe', nickname: 'Unique Name', mileage: 25000 },
        loaded.value
      );

      expect(duplicate.ok).toBe(false);
      if (!duplicate.ok) {
        expect(duplicate.error.code).toBe('NICKNAME_TAKEN');
      }
    });

    it('prevents duplicate nicknames when updating vehicles', () => {
      // Create two vehicles
      const first = service.createVehicle(
        { type: 'sedan', nickname: 'First', mileage: 50000 },
        []
      );
      expect(first.ok).toBe(true);
      if (!first.ok) return;

      const second = service.createVehicle(
        { type: 'coupe', nickname: 'Second', mileage: 25000 },
        [first.value]
      );
      expect(second.ok).toBe(true);
      if (!second.ok) return;

      storage.save([first.value, second.value]);

      // Load from storage
      const loaded = storage.load();
      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;

      // Try to update second to have first's nickname
      const updateResult = service.updateVehicle(
        second.value.id,
        { type: 'coupe', nickname: 'First', mileage: 30000 },
        loaded.value
      );

      expect(updateResult.ok).toBe(false);
      if (!updateResult.ok) {
        expect(updateResult.error.code).toBe('NICKNAME_TAKEN');
      }
    });
  });

  describe('storage corruption recovery', () => {
    it('recovers from corrupted JSON in storage', () => {
      // Manually corrupt storage
      localStorage.setItem('junkyard-tracker-v1', 'invalid-json{]');

      // Load should recover gracefully
      const loadResult = storage.load();
      expect(loadResult.ok).toBe(true);
      if (!loadResult.ok) return;

      expect(loadResult.value).toEqual([]);

      // Should be able to save new data
      const vehicle = service.createVehicle(
        { type: 'sedan', nickname: 'Recovery Test', mileage: 50000 },
        []
      );
      expect(vehicle.ok).toBe(true);
      if (!vehicle.ok) return;

      const saveResult = storage.save([vehicle.value]);
      expect(saveResult.ok).toBe(true);

      // Load should work now
      const finalLoad = storage.load();
      expect(finalLoad.ok).toBe(true);
      if (!finalLoad.ok) return;

      expect(finalLoad.value).toHaveLength(1);
      expect(finalLoad.value[0]?.nickname).toBe('Recovery Test');
    });

    it('recovers from invalid schema in storage', () => {
      // Manually set invalid schema
      localStorage.setItem(
        'junkyard-tracker-v1',
        JSON.stringify({
          version: 999,
          vehicles: [],
        })
      );

      // Load should recover gracefully
      const loadResult = storage.load();
      expect(loadResult.ok).toBe(true);
      if (!loadResult.ok) return;

      expect(loadResult.value).toEqual([]);
    });

    it('recovers from invalid vehicle data in storage', () => {
      // Manually set invalid vehicle data
      localStorage.setItem(
        'junkyard-tracker-v1',
        JSON.stringify({
          version: 1,
          vehicles: [
            {
              id: 'invalid-uuid',
              type: 'sedan',
              nickname: 'Invalid',
              // Missing required fields
            },
          ],
        })
      );

      // Load should recover gracefully
      const loadResult = storage.load();
      expect(loadResult.ok).toBe(true);
      if (!loadResult.ok) return;

      expect(loadResult.value).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA INTEGRITY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('data integrity', () => {
    it('preserves all vehicle fields through save/load cycle', () => {
      const miniVan = service.createVehicle(
        {
          type: 'mini-van',
          nickname: 'Family Van',
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
        },
        []
      );

      expect(miniVan.ok).toBe(true);
      if (!miniVan.ok) return;

      // Save
      storage.save([miniVan.value]);

      // Load
      const loaded = storage.load();
      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;

      const loadedVan = loaded.value[0];
      expect(loadedVan).toBeDefined();
      if (!loadedVan || loadedVan.type !== 'mini-van') return;

      // Verify all fields
      expect(loadedVan.id).toBe(miniVan.value.id);
      expect(loadedVan.type).toBe('mini-van');
      expect(loadedVan.nickname).toBe('Family Van');
      expect(loadedVan.mileage).toBe(80000);
      expect(loadedVan.wheels).toBe(4);
      expect(loadedVan.doors).toBe(4);
      expect(loadedVan.doorConfig).toEqual([
        { sliding: false },
        { sliding: false },
        { sliding: true },
        { sliding: true },
      ]);
      expect(loadedVan.engineStatus).toBe('fixable');
      expect(loadedVan.registration).toBeDefined();
      expect(loadedVan.createdAt).toBe(miniVan.value.createdAt);
      expect(loadedVan.updatedAt).toBe(miniVan.value.updatedAt);
    });

    it('preserves registration status through save/load', () => {
      // Create vehicle with failed registration
      const highMileageSed an = service.createVehicle(
        { type: 'sedan', nickname: 'Old Sedan', mileage: 150000 },
        []
      );

      expect(highMileageSed an.ok).toBe(true);
      if (!highMileageSed an.ok) return;

      expect(highMileageSed an.value.registration.status).toBe('failed');

      // Save and load
      storage.save([highMileageSed an.value]);
      const loaded = storage.load();

      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;

      const loadedVehicle = loaded.value[0];
      expect(loadedVehicle?.registration.status).toBe('failed');
      if (loadedVehicle?.registration.status === 'failed') {
        expect(loadedVehicle.registration.registrationError).toContain('150,000');
      }
    });

    it('maintains registration immutability through updates', () => {
      const vehicle = service.createVehicle(
        { type: 'sedan', nickname: 'Test', mileage: 50000 },
        []
      );

      expect(vehicle.ok).toBe(true);
      if (!vehicle.ok) return;

      const originalRegistration = vehicle.value.registration;

      // Update vehicle
      const updated = service.updateVehicle(
        vehicle.value.id,
        { type: 'sedan', nickname: 'Updated', mileage: 60000 },
        [vehicle.value]
      );

      expect(updated.ok).toBe(true);
      if (!updated.ok) return;

      // Registration should be unchanged
      expect(updated.value.registration).toEqual(originalRegistration);

      // Save and load
      storage.save([updated.value]);
      const loaded = storage.load();

      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;

      // Registration should still be unchanged
      expect(loaded.value[0]?.registration).toEqual(originalRegistration);
    });
  });
});
