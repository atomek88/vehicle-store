import { VehicleType, Registration } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION BUSINESS RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Business rules for vehicle registration:
 * - Sedans with mileage > 100,000 fail registration
 * - Motorcycles with mileage > 50,000 fail registration
 * - All other vehicles register successfully
 */

const SEDAN_MAX_MILEAGE = 100_000;
const MOTORCYCLE_MAX_MILEAGE = 50_000;

interface RegistrationInput {
  type: VehicleType;
  mileage: number;
}

/**
 * Attempts to register a vehicle based on its type and mileage.
 * Returns a Registration discriminated union (success or failure).
 */
export function attemptRegistration(input: RegistrationInput): Registration {
  const { type, mileage } = input;

  // Check sedan mileage limit
  if (type === 'sedan' && mileage > SEDAN_MAX_MILEAGE) {
    return {
      status: 'failed',
      registrationError: `Sedan mileage (${mileage.toLocaleString()}) exceeds maximum allowed (${SEDAN_MAX_MILEAGE.toLocaleString()})`,
    };
  }

  // Check motorcycle mileage limit
  if (type === 'motorcycle' && mileage > MOTORCYCLE_MAX_MILEAGE) {
    return {
      status: 'failed',
      registrationError: `Motorcycle mileage (${mileage.toLocaleString()}) exceeds maximum allowed (${MOTORCYCLE_MAX_MILEAGE.toLocaleString()})`,
    };
  }

  // All other cases: successful registration
  return {
    status: 'registered',
    registrationId: generateRegistrationId(type),
  };
}

/**
 * Generates a registration ID in the format: TYPE-XXXXX
 * where TYPE is the uppercase vehicle type and XXXXX is a random alphanumeric string.
 */
function generateRegistrationId(type: VehicleType): string {
  const prefix = type.toUpperCase().replace('-', '');
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${suffix}`;
}

/**
 * Checks if a registration represents a successful registration.
 */
export function isRegistered(registration: Registration): registration is { status: 'registered'; registrationId: string } {
  return registration.status === 'registered';
}

/**
 * Checks if a registration represents a failed registration.
 */
export function isFailed(registration: Registration): registration is { status: 'failed'; registrationError: string } {
  return registration.status === 'failed';
}
