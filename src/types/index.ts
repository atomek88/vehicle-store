// ═══════════════════════════════════════════════════════════════════════════
// ENUMS & LITERALS
// ═══════════════════════════════════════════════════════════════════════════

export const VEHICLE_TYPES = ['sedan', 'coupe', 'mini-van', 'motorcycle'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const ENGINE_STATUSES = ['works', 'fixable', 'junk'] as const;
export type EngineStatus = (typeof ENGINE_STATUSES)[number];

export const SEAT_STATUSES = ['works', 'fixable', 'junk'] as const;
export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const MILEAGE_RATINGS = ['low', 'medium', 'high'] as const;
export type MileageRating = (typeof MILEAGE_RATINGS)[number];

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION (Discriminated Union)
// ═══════════════════════════════════════════════════════════════════════════

export type Registration =
  | { status: 'registered'; registrationId: string }
  | { status: 'failed'; registrationError: string };

// ═══════════════════════════════════════════════════════════════════════════
// VEHICLE BASE & VARIANTS (Discriminated Union)
// ═══════════════════════════════════════════════════════════════════════════

interface VehicleBase {
  id: string;                    // UUID v4
  nickname: string;              // Unique, case-insensitive
  mileage: number;               // >= 0, integer
  engineStatus: EngineStatus;
  registration: Registration;    // Immutable after creation
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}

export interface Sedan extends VehicleBase {
  type: 'sedan';
  wheels: 0 | 1 | 2 | 3 | 4;
  doors: 0 | 1 | 2 | 3 | 4;
}

export interface Coupe extends VehicleBase {
  type: 'coupe';
  wheels: 0 | 1 | 2 | 3 | 4;
  doors: 0 | 1 | 2;
}

export interface MiniVan extends VehicleBase {
  type: 'mini-van';
  wheels: 0 | 1 | 2 | 3 | 4;
  doors: 0 | 1 | 2 | 3 | 4;
  doorConfig: DoorConfigItem[];  // length === doors
}

export interface DoorConfigItem {
  sliding: boolean;
}

export interface Motorcycle extends VehicleBase {
  type: 'motorcycle';
  wheels: 0 | 1 | 2;
  seatStatus: SeatStatus;
}

export type Vehicle = Sedan | Coupe | MiniVan | Motorcycle;

// ═══════════════════════════════════════════════════════════════════════════
// RESULT TYPE (Functional Error Handling)
// ═══════════════════════════════════════════════════════════════════════════

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface DomainError {
  code: 
    | 'VALIDATION_ERROR'
    | 'NICKNAME_TAKEN'
    | 'VEHICLE_NOT_FOUND'
    | 'CANNOT_CHANGE_TYPE'
    | 'STORAGE_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export interface VehicleFilters {
  query: string;
  types: VehicleType[];
  registrationStatuses: ('registered' | 'failed')[];
  engineStatuses: EngineStatus[];
}

export interface VehicleSorting {
  key: 'createdAt' | 'nickname' | 'mileage';
  direction: 'asc' | 'desc';
}

export type HydrationStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface VehicleState {
  vehicles: Vehicle[];
  filters: VehicleFilters;
  sorting: VehicleSorting;
  hydrationStatus: HydrationStatus;
  hydrationError?: string;
}
