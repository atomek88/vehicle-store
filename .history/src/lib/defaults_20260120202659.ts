import { VehicleType, EngineStatus, SeatStatus } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES FOR VEHICLE FIELDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Default engine status for all vehicles
 */
export const DEFAULT_ENGINE_STATUS: EngineStatus = 'works';

/**
 * Default seat status for motorcycles
 */
export const DEFAULT_SEAT_STATUS: SeatStatus = 'works';

/**
 * Default number of wheels based on vehicle type
 */
export function getDefaultWheels(type: VehicleType): 0 | 1 | 2 | 3 | 4 {
  switch (type) {
    case 'sedan':
    case 'coupe':
    case 'mini-van':
      return 4;
    case 'motorcycle':
      return 2;
    default:
      // Exhaustiveness check - TypeScript will error if we miss a case
      const _exhaustive: never = type;
      return _exhaustive;
  }
}

/**
 * Default number of doors based on vehicle type
 */
export function getDefaultDoors(type: VehicleType): 0 | 1 | 2 | 3 | 4 {
  switch (type) {
    case 'sedan':
    case 'mini-van':
      return 4;
    case 'coupe':
      return 2;
    case 'motorcycle':
      // Motorcycles don't have doors field, but TypeScript requires all cases
      return 0;
    default:
      const _exhaustive: never = type;
      return _exhaustive;
  }
}

/**
 * Default door configuration for mini-vans
 * Returns an array of door configs matching the number of doors
 */
export function getDefaultDoorConfig(doors: number): Array<{ sliding: boolean }> {
  return Array.from({ length: doors }, (_, index) => ({
    // First two doors are regular, rest are sliding
    sliding: index >= 2,
  }));
}
