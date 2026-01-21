import { describe, it, expect } from 'vitest';
import { attemptRegistration, isRegistered, isFailed } from './registration';

describe('attemptRegistration', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // SEDAN REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('sedan registration', () => {
    it('registers sedan with mileage at limit (100,000)', () => {
      const result = attemptRegistration({ type: 'sedan', mileage: 100_000 });

      expect(result.status).toBe('registered');
      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^SEDAN-[A-Z0-9]{5}$/);
      }
    });

    it('registers sedan with mileage below limit', () => {
      const result = attemptRegistration({ type: 'sedan', mileage: 50_000 });

      expect(result.status).toBe('registered');
      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^SEDAN-[A-Z0-9]{5}$/);
      }
    });

    it('registers sedan with zero mileage', () => {
      const result = attemptRegistration({ type: 'sedan', mileage: 0 });

      expect(result.status).toBe('registered');
    });

    it('fails sedan with mileage over limit (100,001)', () => {
      const result = attemptRegistration({ type: 'sedan', mileage: 100_001 });

      expect(result.status).toBe('failed');
      if (result.status === 'failed') {
        expect(result.registrationError).toContain('100,001');
        expect(result.registrationError).toContain('100,000');
        expect(result.registrationError).toContain('Sedan');
      }
    });

    it('fails sedan with very high mileage', () => {
      const result = attemptRegistration({ type: 'sedan', mileage: 250_000 });

      expect(result.status).toBe('failed');
      if (result.status === 'failed') {
        expect(result.registrationError).toContain('250,000');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MOTORCYCLE REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('motorcycle registration', () => {
    it('registers motorcycle with mileage at limit (50,000)', () => {
      const result = attemptRegistration({ type: 'motorcycle', mileage: 50_000 });

      expect(result.status).toBe('registered');
      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^MOTORCYCLE-[A-Z0-9]{5}$/);
      }
    });

    it('registers motorcycle with mileage below limit', () => {
      const result = attemptRegistration({ type: 'motorcycle', mileage: 25_000 });

      expect(result.status).toBe('registered');
    });

    it('registers motorcycle with zero mileage', () => {
      const result = attemptRegistration({ type: 'motorcycle', mileage: 0 });

      expect(result.status).toBe('registered');
    });

    it('fails motorcycle with mileage over limit (50,001)', () => {
      const result = attemptRegistration({ type: 'motorcycle', mileage: 50_001 });

      expect(result.status).toBe('failed');
      if (result.status === 'failed') {
        expect(result.registrationError).toContain('50,001');
        expect(result.registrationError).toContain('50,000');
        expect(result.registrationError).toContain('Motorcycle');
      }
    });

    it('fails motorcycle with very high mileage', () => {
      const result = attemptRegistration({ type: 'motorcycle', mileage: 100_000 });

      expect(result.status).toBe('failed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COUPE REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('coupe registration', () => {
    it('registers coupe with any mileage (no limit)', () => {
      const testCases = [0, 50_000, 100_000, 150_000, 250_000];

      testCases.forEach((mileage) => {
        const result = attemptRegistration({ type: 'coupe', mileage });
        expect(result.status).toBe('registered');
      });
    });

    it('generates correct registration ID format for coupe', () => {
      const result = attemptRegistration({ type: 'coupe', mileage: 50_000 });

      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^COUPE-[A-Z0-9]{5}$/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MINI-VAN REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('mini-van registration', () => {
    it('registers mini-van with any mileage (no limit)', () => {
      const testCases = [0, 50_000, 100_000, 150_000, 250_000];

      testCases.forEach((mileage) => {
        const result = attemptRegistration({ type: 'mini-van', mileage });
        expect(result.status).toBe('registered');
      });
    });

    it('generates correct registration ID format for mini-van', () => {
      const result = attemptRegistration({ type: 'mini-van', mileage: 80_000 });

      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^MINIVAN-[A-Z0-9]{5}$/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION ID TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('registration ID generation', () => {
    it('generates unique IDs for multiple registrations', () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const result = attemptRegistration({ type: 'sedan', mileage: 50_000 });
        if (result.status === 'registered') {
          ids.add(result.registrationId);
        }
      }

      // Should have 100 unique IDs (or very close due to randomness)
      expect(ids.size).toBeGreaterThan(95);
    });

    it('includes vehicle type in registration ID', () => {
      const sedan = attemptRegistration({ type: 'sedan', mileage: 0 });
      const coupe = attemptRegistration({ type: 'coupe', mileage: 0 });
      const miniVan = attemptRegistration({ type: 'mini-van', mileage: 0 });
      const motorcycle = attemptRegistration({ type: 'motorcycle', mileage: 0 });

      if (sedan.status === 'registered') {
        expect(sedan.registrationId).toContain('SEDAN');
      }
      if (coupe.status === 'registered') {
        expect(coupe.registrationId).toContain('COUPE');
      }
      if (miniVan.status === 'registered') {
        expect(miniVan.registrationId).toContain('MINIVAN');
      }
      if (motorcycle.status === 'registered') {
        expect(motorcycle.registrationId).toContain('MOTORCYCLE');
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARD TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('isRegistered', () => {
  it('returns true for successful registration', () => {
    const registration = attemptRegistration({ type: 'sedan', mileage: 50_000 });
    expect(isRegistered(registration)).toBe(true);
  });

  it('returns false for failed registration', () => {
    const registration = attemptRegistration({ type: 'sedan', mileage: 150_000 });
    expect(isRegistered(registration)).toBe(false);
  });

  it('narrows type correctly', () => {
    const registration = attemptRegistration({ type: 'coupe', mileage: 25_000 });

    if (isRegistered(registration)) {
      // TypeScript should know this has registrationId
      expect(registration.registrationId).toBeDefined();
      expect(typeof registration.registrationId).toBe('string');
    }
  });
});

describe('isFailed', () => {
  it('returns true for failed registration', () => {
    const registration = attemptRegistration({ type: 'motorcycle', mileage: 75_000 });
    expect(isFailed(registration)).toBe(true);
  });

  it('returns false for successful registration', () => {
    const registration = attemptRegistration({ type: 'coupe', mileage: 50_000 });
    expect(isFailed(registration)).toBe(false);
  });

  it('narrows type correctly', () => {
    const registration = attemptRegistration({ type: 'sedan', mileage: 200_000 });

    if (isFailed(registration)) {
      // TypeScript should know this has registrationError
      expect(registration.registrationError).toBeDefined();
      expect(typeof registration.registrationError).toBe('string');
    }
  });
});
