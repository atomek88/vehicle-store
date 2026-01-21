import { Vehicle } from '@/types';
import { StorageSchemaV1, VehiclePersistedSchema } from '@/validations/schemas';
import { Result, DomainError } from '@/types';

const STORAGE_KEY = 'junkyard-tracker-v1';

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE REPOSITORY
// ═══════════════════════════════════════════════════════════════════════════

export interface StorageRepository {
  save(vehicles: Vehicle[]): Result<void, DomainError>;
  load(): Result<Vehicle[], DomainError>;
  clear(): void;
}

/**
 * LocalStorage-based repository for vehicle data persistence.
 * Handles serialization, validation, and error recovery.
 */
export function createStorageRepository(): StorageRepository {
  return {
    save(vehicles: Vehicle[]): Result<void, DomainError> {
      try {
        // Validate all vehicles before saving
        const validationResults = vehicles.map((v) => 
          VehiclePersistedSchema.safeParse(v)
        );

        const firstError = validationResults.find((r) => !r.success);
        if (firstError && !firstError.success) {
          return {
            ok: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid vehicle data cannot be saved',
              fieldErrors: firstError.error.flatten().fieldErrors as Record<string, string>,
            },
          };
        }

        const data = {
          version: 1 as const,
          vehicles,
        };

        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);

        return { ok: true, value: undefined };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: 'STORAGE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to save data',
          },
        };
      }
    },

    load(): Result<Vehicle[], DomainError> {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);

        // No data stored yet - return empty array
        if (!raw) {
          return { ok: true, value: [] };
        }

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          // Corrupted JSON - clear storage and return empty
          localStorage.removeItem(STORAGE_KEY);
          return { ok: true, value: [] };
        }

        // Validate against schema
        const result = StorageSchemaV1.safeParse(parsed);

        if (!result.success) {
          // Invalid schema - clear storage and return empty
          localStorage.removeItem(STORAGE_KEY);
          return { ok: true, value: [] };
        }

        return { ok: true, value: result.data.vehicles };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: 'STORAGE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to load data',
          },
        };
      }
    },

    clear(): void {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}

/**
 * Singleton instance for the storage repository.
 * Use this in production code.
 */
export const storageRepository = createStorageRepository();
