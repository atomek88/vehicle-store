import { describe, it, expect } from 'vitest';
import {
  NicknameSchema,
  MileageSchema,
  VehicleFormInputSchema,
  VehiclePersistedSchema,
  MiniVanPersistedSchema,
  CoupeFormInputSchema,
  RegistrationSchema,
} from './schemas';

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVE SCHEMA TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('NicknameSchema', () => {
  it('accepts valid nicknames', () => {
    expect(NicknameSchema.parse('Rusty Bucket')).toBe('Rusty Bucket');
    expect(NicknameSchema.parse('  trimmed  ')).toBe('trimmed');
    expect(NicknameSchema.parse('a')).toBe('a');
  });

  it('rejects empty strings', () => {
    expect(() => NicknameSchema.parse('')).toThrow('Nickname is required');
  });

  it('rejects whitespace-only strings', () => {
    expect(() => NicknameSchema.parse('   ')).toThrow('cannot be only whitespace');
  });

  it('rejects strings over 50 characters', () => {
    const longName = 'a'.repeat(51);
    expect(() => NicknameSchema.parse(longName)).toThrow('50 characters or fewer');
  });

  it('accepts exactly 50 characters', () => {
    const maxName = 'a'.repeat(50);
    expect(NicknameSchema.parse(maxName)).toBe(maxName);
  });
});

describe('MileageSchema', () => {
  it('accepts zero', () => {
    expect(MileageSchema.parse(0)).toBe(0);
  });

  it('accepts positive integers', () => {
    expect(MileageSchema.parse(150000)).toBe(150000);
    expect(MileageSchema.parse(1)).toBe(1);
  });

  it('rejects negative numbers', () => {
    expect(() => MileageSchema.parse(-1)).toThrow('cannot be negative');
    expect(() => MileageSchema.parse(-100)).toThrow('cannot be negative');
  });

  it('rejects decimals', () => {
    expect(() => MileageSchema.parse(100.5)).toThrow('whole number');
    expect(() => MileageSchema.parse(0.1)).toThrow('whole number');
  });

  it('rejects non-numbers', () => {
    expect(() => MileageSchema.parse('100' as any)).toThrow('must be a number');
    expect(() => MileageSchema.parse(null as any)).toThrow('must be a number');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION SCHEMA TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('RegistrationSchema', () => {
  it('validates successful registration', () => {
    const registration = {
      status: 'registered' as const,
      registrationId: 'SEDAN-ABC12',
    };
    expect(RegistrationSchema.parse(registration)).toEqual(registration);
  });

  it('validates failed registration', () => {
    const registration = {
      status: 'failed' as const,
      registrationError: 'Mileage too high',
    };
    expect(RegistrationSchema.parse(registration)).toEqual(registration);
  });

  it('rejects invalid status', () => {
    const invalid = {
      status: 'pending' as any,
      registrationId: 'TEST-123',
    };
    expect(() => RegistrationSchema.parse(invalid)).toThrow();
  });

  it('rejects empty registration ID', () => {
    const invalid = {
      status: 'registered' as const,
      registrationId: '',
    };
    expect(() => RegistrationSchema.parse(invalid)).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FORM INPUT SCHEMA TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('VehicleFormInputSchema', () => {
  it('validates sedan input with minimal fields', () => {
    const input = {
      type: 'sedan' as const,
      nickname: 'Test Sedan',
      mileage: 50000,
    };
    expect(VehicleFormInputSchema.parse(input)).toMatchObject(input);
  });

  it('validates sedan input with all optional fields', () => {
    const input = {
      type: 'sedan' as const,
      nickname: 'Test Sedan',
      mileage: 50000,
      wheels: 4 as const,
      doors: 4 as const,
      engineStatus: 'works' as const,
    };
    expect(VehicleFormInputSchema.parse(input)).toMatchObject(input);
  });

  it('validates coupe with all optional fields', () => {
    const input = {
      type: 'coupe' as const,
      nickname: 'Test Coupe',
      mileage: 25000,
      wheels: 4 as const,
      doors: 2 as const,
      engineStatus: 'works' as const,
    };
    expect(VehicleFormInputSchema.parse(input)).toMatchObject(input);
  });

  it('validates motorcycle with seat status', () => {
    const input = {
      type: 'motorcycle' as const,
      nickname: 'Test Bike',
      mileage: 10000,
      wheels: 2 as const,
      seatStatus: 'fixable' as const,
      engineStatus: 'works' as const,
    };
    expect(VehicleFormInputSchema.parse(input)).toMatchObject(input);
  });

  it('validates mini-van with door config', () => {
    const input = {
      type: 'mini-van' as const,
      nickname: 'Family Van',
      mileage: 80000,
      wheels: 4 as const,
      doors: 4 as const,
      doorConfig: [
        { sliding: false },
        { sliding: false },
        { sliding: true },
        { sliding: true },
      ],
      engineStatus: 'works' as const,
    };
    expect(VehicleFormInputSchema.parse(input)).toMatchObject(input);
  });
});

describe('CoupeFormInputSchema', () => {
  it('rejects coupe with invalid door count', () => {
    const input = {
      type: 'coupe' as const,
      nickname: 'Bad Coupe',
      mileage: 25000,
      doors: 4, // Invalid for coupe (max 2)
    };
    expect(() => VehicleFormInputSchema.parse(input)).toThrow();
  });

  it('accepts coupe with 0, 1, or 2 doors', () => {
    const base = {
      type: 'coupe' as const,
      nickname: 'Test Coupe',
      mileage: 25000,
    };

    expect(CoupeFormInputSchema.parse({ ...base, doors: 0 as const })).toMatchObject({ ...base, doors: 0 });
    expect(CoupeFormInputSchema.parse({ ...base, doors: 1 as const })).toMatchObject({ ...base, doors: 1 });
    expect(CoupeFormInputSchema.parse({ ...base, doors: 2 as const })).toMatchObject({ ...base, doors: 2 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTED SCHEMA TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('VehiclePersistedSchema', () => {
  const baseVehicle = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nickname: 'Test Vehicle',
    mileage: 50000,
    engineStatus: 'works' as const,
    registration: {
      status: 'registered' as const,
      registrationId: 'SEDAN-ABC12',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('validates complete sedan', () => {
    const sedan = {
      ...baseVehicle,
      type: 'sedan' as const,
      wheels: 4 as const,
      doors: 4 as const,
    };
    expect(VehiclePersistedSchema.parse(sedan)).toEqual(sedan);
  });

  it('validates complete coupe', () => {
    const coupe = {
      ...baseVehicle,
      type: 'coupe' as const,
      wheels: 4 as const,
      doors: 2 as const,
    };
    expect(VehiclePersistedSchema.parse(coupe)).toEqual(coupe);
  });

  it('validates complete motorcycle', () => {
    const motorcycle = {
      ...baseVehicle,
      type: 'motorcycle' as const,
      wheels: 2 as const,
      seatStatus: 'works' as const,
    };
    expect(VehiclePersistedSchema.parse(motorcycle)).toEqual(motorcycle);
  });

  it('rejects vehicle with missing required fields', () => {
    const invalid = {
      type: 'sedan' as const,
      nickname: 'Incomplete',
      mileage: 50000,
      // Missing: id, engineStatus, registration, createdAt, updatedAt, wheels, doors
    };
    expect(() => VehiclePersistedSchema.parse(invalid)).toThrow();
  });

  it('rejects vehicle with invalid UUID', () => {
    const invalid = {
      ...baseVehicle,
      id: 'not-a-uuid',
      type: 'sedan' as const,
      wheels: 4 as const,
      doors: 4 as const,
    };
    expect(() => VehiclePersistedSchema.parse(invalid)).toThrow();
  });

  it('rejects vehicle with invalid datetime', () => {
    const invalid = {
      ...baseVehicle,
      createdAt: 'not-a-datetime',
      type: 'sedan' as const,
      wheels: 4 as const,
      doors: 4 as const,
    };
    expect(() => VehiclePersistedSchema.parse(invalid)).toThrow();
  });
});

describe('MiniVanPersistedSchema', () => {
  const baseMiniVan = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'mini-van' as const,
    nickname: 'Family Van',
    mileage: 80000,
    wheels: 4 as const,
    doors: 4 as const,
    engineStatus: 'works' as const,
    registration: {
      status: 'registered' as const,
      registrationId: 'MINIVAN-ABC12',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('validates when doorConfig length matches doors', () => {
    const validMiniVan = {
      ...baseMiniVan,
      doorConfig: [
        { sliding: false },
        { sliding: false },
        { sliding: true },
        { sliding: true },
      ],
    };
    expect(VehiclePersistedSchema.parse(validMiniVan)).toEqual(validMiniVan);
  });

  it('rejects when doorConfig length does not match doors', () => {
    const invalidMiniVan = {
      ...baseMiniVan,
      doors: 3 as const, // Mismatch with doorConfig.length (4)
      doorConfig: [
        { sliding: false },
        { sliding: false },
        { sliding: true },
        { sliding: true },
      ],
    };
    expect(() => VehiclePersistedSchema.parse(invalidMiniVan)).toThrow('doorConfig length');
  });

  it('validates with 0 doors and empty doorConfig', () => {
    const miniVan = {
      ...baseMiniVan,
      doors: 0 as const,
      doorConfig: [],
    };
    expect(VehiclePersistedSchema.parse(miniVan)).toEqual(miniVan);
  });

  it('rejects when doorConfig has more items than doors', () => {
    const invalidMiniVan = {
      ...baseMiniVan,
      doors: 2 as const,
      doorConfig: [
        { sliding: false },
        { sliding: false },
        { sliding: true },
      ],
    };
    expect(() => VehiclePersistedSchema.parse(invalidMiniVan)).toThrow('doorConfig length');
  });
});
