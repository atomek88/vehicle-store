import { VehicleType, Registration } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION BUSINESS RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Business rules for vehicle registration:
 * - All vehicles register successfully when created
 * - Registration is immutable after creation
 */

interface RegistrationInput {
  type: VehicleType;
}

/**
 * Registers a vehicle and generates a unique registration ID.
 * Always returns a successful registration.
 */
export function attemptRegistration(input: RegistrationInput): Registration {
  const { type } = input;

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
