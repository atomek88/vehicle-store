import { v4 as uuidv4 } from 'uuid';
import { Vehicle, Result, DomainError, Sedan, Coupe, MiniVan, Motorcycle } from '@/types';
import { VehicleFormInput } from '@/validations/schemas';
import { attemptRegistration } from './registration';
import { 
  DEFAULT_ENGINE_STATUS, 
  DEFAULT_SEAT_STATUS, 
  getDefaultWheels, 
  getDefaultDoors, 
  getDefaultDoorConfig 
} from './defaults';

// ═══════════════════════════════════════════════════════════════════════════
// VEHICLE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export interface VehicleService {
  createVehicle(input: VehicleFormInput, existingVehicles: Vehicle[]): Result<Vehicle, DomainError>;
  updateVehicle(id: string, input: VehicleFormInput, existingVehicles: Vehicle[]): Result<Vehicle, DomainError>;
  deleteVehicle(id: string, existingVehicles: Vehicle[]): Result<Vehicle[], DomainError>;
}

/**
 * Creates a vehicle service instance with CRUD operations.
 * All operations validate business rules and return Result types.
 */
export function createVehicleService(): VehicleService {
  return {
    createVehicle(input: VehicleFormInput, existingVehicles: Vehicle[]): Result<Vehicle, DomainError> {
      // Check nickname uniqueness (case-insensitive)
      const normalizedNickname = input.nickname.toLowerCase().trim();
      const isDuplicate = existingVehicles.some(
        (v) => v.nickname.toLowerCase().trim() === normalizedNickname
      );

      if (isDuplicate) {
        return {
          ok: false,
          error: {
            code: 'NICKNAME_TAKEN',
            message: `A vehicle with nickname "${input.nickname}" already exists`,
            fieldErrors: { nickname: 'This nickname is already in use' },
          },
        };
      }

      // Apply defaults and create vehicle based on type
      const now = new Date().toISOString();
      const baseFields = {
        id: uuidv4(),
        nickname: input.nickname.trim(),
        mileage: input.mileage,
        engineStatus: input.engineStatus ?? DEFAULT_ENGINE_STATUS,
        createdAt: now,
        updatedAt: now,
      };

      let vehicle: Vehicle;

      switch (input.type) {
        case 'sedan': {
          const wheels = input.wheels ?? getDefaultWheels('sedan');
          const doors = input.doors ?? getDefaultDoors('sedan');
          const registration = attemptRegistration({ type: 'sedan', mileage: input.mileage });

          vehicle = {
            ...baseFields,
            type: 'sedan',
            wheels,
            doors,
            registration,
          } satisfies Sedan;
          break;
        }

        case 'coupe': {
          const wheels = input.wheels ?? getDefaultWheels('coupe');
          const doors = (input.doors ?? getDefaultDoors('coupe')) as 0 | 1 | 2;
          const registration = attemptRegistration({ type: 'coupe', mileage: input.mileage });

          vehicle = {
            ...baseFields,
            type: 'coupe',
            wheels,
            doors,
            registration,
          } satisfies Coupe;
          break;
        }

        case 'mini-van': {
          const wheels = input.wheels ?? getDefaultWheels('mini-van');
          const doors = input.doors ?? getDefaultDoors('mini-van');
          const doorConfig = input.doorConfig ?? getDefaultDoorConfig(doors);
          const registration = attemptRegistration({ type: 'mini-van', mileage: input.mileage });

          vehicle = {
            ...baseFields,
            type: 'mini-van',
            wheels,
            doors,
            doorConfig,
            registration,
          } satisfies MiniVan;
          break;
        }

        case 'motorcycle': {
          const wheels = (input.wheels ?? getDefaultWheels('motorcycle')) as 0 | 1 | 2;
          const seatStatus = input.seatStatus ?? DEFAULT_SEAT_STATUS;
          const registration = attemptRegistration({ type: 'motorcycle', mileage: input.mileage });

          vehicle = {
            ...baseFields,
            type: 'motorcycle',
            wheels,
            seatStatus,
            registration,
          } satisfies Motorcycle;
          break;
        }

        default: {
          const _exhaustive: never = input;
          return _exhaustive;
        }
      }

      return { ok: true, value: vehicle };
    },

    updateVehicle(id: string, input: VehicleFormInput, existingVehicles: Vehicle[]): Result<Vehicle, DomainError> {
      // Find the vehicle to update
      const existingVehicle = existingVehicles.find((v) => v.id === id);

      if (!existingVehicle) {
        return {
          ok: false,
          error: {
            code: 'VEHICLE_NOT_FOUND',
            message: `Vehicle with id "${id}" not found`,
          },
        };
      }

      // Cannot change vehicle type
      if (input.type !== existingVehicle.type) {
        return {
          ok: false,
          error: {
            code: 'CANNOT_CHANGE_TYPE',
            message: `Cannot change vehicle type from "${existingVehicle.type}" to "${input.type}"`,
          },
        };
      }

      // Check nickname uniqueness (case-insensitive), excluding current vehicle
      const normalizedNickname = input.nickname.toLowerCase().trim();
      const isDuplicate = existingVehicles.some(
        (v) => v.id !== id && v.nickname.toLowerCase().trim() === normalizedNickname
      );

      if (isDuplicate) {
        return {
          ok: false,
          error: {
            code: 'NICKNAME_TAKEN',
            message: `A vehicle with nickname "${input.nickname}" already exists`,
            fieldErrors: { nickname: 'This nickname is already in use' },
          },
        };
      }

      // Update vehicle fields (registration is immutable)
      const updatedAt = new Date().toISOString();
      const baseFields = {
        ...existingVehicle,
        nickname: input.nickname.trim(),
        mileage: input.mileage,
        engineStatus: input.engineStatus ?? existingVehicle.engineStatus,
        updatedAt,
      };

      let updatedVehicle: Vehicle;

      switch (input.type) {
        case 'sedan': {
          const wheels = input.wheels ?? (existingVehicle as Sedan).wheels;
          const doors = input.doors ?? (existingVehicle as Sedan).doors;

          updatedVehicle = {
            ...baseFields,
            type: 'sedan',
            wheels,
            doors,
          } satisfies Sedan;
          break;
        }

        case 'coupe': {
          const wheels = input.wheels ?? (existingVehicle as Coupe).wheels;
          const doors = (input.doors ?? (existingVehicle as Coupe).doors) as 0 | 1 | 2;

          updatedVehicle = {
            ...baseFields,
            type: 'coupe',
            wheels,
            doors,
          } satisfies Coupe;
          break;
        }

        case 'mini-van': {
          const wheels = input.wheels ?? (existingVehicle as MiniVan).wheels;
          const doors = input.doors ?? (existingVehicle as MiniVan).doors;
          const doorConfig = input.doorConfig ?? (existingVehicle as MiniVan).doorConfig;

          updatedVehicle = {
            ...baseFields,
            type: 'mini-van',
            wheels,
            doors,
            doorConfig,
          } satisfies MiniVan;
          break;
        }

        case 'motorcycle': {
          const wheels = (input.wheels ?? (existingVehicle as Motorcycle).wheels) as 0 | 1 | 2;
          const seatStatus = input.seatStatus ?? (existingVehicle as Motorcycle).seatStatus;

          updatedVehicle = {
            ...baseFields,
            type: 'motorcycle',
            wheels,
            seatStatus,
          } satisfies Motorcycle;
          break;
        }

        default: {
          const _exhaustive: never = input;
          return _exhaustive;
        }
      }

      return { ok: true, value: updatedVehicle };
    },

    deleteVehicle(id: string, existingVehicles: Vehicle[]): Result<Vehicle[], DomainError> {
      const vehicleIndex = existingVehicles.findIndex((v) => v.id === id);

      if (vehicleIndex === -1) {
        return {
          ok: false,
          error: {
            code: 'VEHICLE_NOT_FOUND',
            message: `Vehicle with id "${id}" not found`,
          },
        };
      }

      const updatedVehicles = existingVehicles.filter((v) => v.id !== id);
      return { ok: true, value: updatedVehicles };
    },
  };
}

/**
 * Singleton instance for the vehicle service.
 * Use this in production code.
 */
export const vehicleService = createVehicleService();
