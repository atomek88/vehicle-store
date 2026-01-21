import { describe, it, expect } from 'vitest';
import { attemptRegistration, isRegistered, isFailed } from './registration';

describe('attemptRegistration', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // SEDAN REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('sedan registration', () => {
    it('registers sedan successfully', () => {
      const result = attemptRegistration({ type: 'sedan' });

      expect(result.status).toBe('registered');
      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^SEDAN-[A-Z0-9]{5}$/);
      }
    });

    it('generates unique registration IDs for sedans', () => {
      const result1 = attemptRegistration({ type: 'sedan' });
      const result2 = attemptRegistration({ type: 'sedan' });

      expect(result1.status).toBe('registered');
      expect(result2.status).toBe('registered');
      if (result1.status === 'registered' && result2.status === 'registered') {
        expect(result1.registrationId).not.toBe(result2.registrationId);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MOTORCYCLE REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('motorcycle registration', () => {
    it('registers motorcycle successfully', () => {
      const result = attemptRegistration({ type: 'motorcycle' });

      expect(result.status).toBe('registered');
      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^MOTORCYCLE-[A-Z0-9]{5}$/);
      }
    });

    it('generates unique registration IDs for motorcycles', () => {
      const result1 = attemptRegistration({ type: 'motorcycle' });
      const result2 = attemptRegistration({ type: 'motorcycle' });

      expect(result1.status).toBe('registered');
      expect(result2.status).toBe('registered');
      if (result1.status === 'registered' && result2.status === 'registered') {
        expect(result1.registrationId).not.toBe(result2.registrationId);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COUPE REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('coupe registration', () => {
    it('registers coupe successfully', () => {
      const result = attemptRegistration({ type: 'coupe' });

      expect(result.status).toBe('registered');
      if (result.status === 'registered') {
        expect(result.registrationId).toMatch(/^COUPE-[A-Z0-9]{5}$/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MINI-VAN REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('mini-van registration', () => {
    it('registers mini-van successfully', () => {
      const result = attemptRegistration({ type: 'mini-van' });

      expect(result.status).toBe('registered');
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
        const result = attemptRegistration({ type: 'sedan' });
        if (result.status === 'registered') {
          ids.add(result.registrationId);
        }
      }

      // Should have 100 unique IDs (or very close due to randomness)
      expect(ids.size).toBeGreaterThan(95);
    });

    it('includes vehicle type in registration ID', () => {
      const sedan = attemptRegistration({ type: 'sedan' });
      const coupe = attemptRegistration({ type: 'coupe' });
      const miniVan = attemptRegistration({ type: 'mini-van' });
      const motorcycle = attemptRegistration({ type: 'motorcycle' });

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
    const registration = attemptRegistration({ type: 'sedan' });
    expect(isRegistered(registration)).toBe(true);
  });

  it('narrows type correctly', () => {
    const registration = attemptRegistration({ type: 'coupe' });

    if (isRegistered(registration)) {
      // TypeScript should know this has registrationId
      expect(registration.registrationId).toBeDefined();
      expect(typeof registration.registrationId).toBe('string');
    }
  });
});

describe('isFailed', () => {
  it('returns false for successful registration', () => {
    const registration = attemptRegistration({ type: 'coupe' });
    expect(isFailed(registration)).toBe(false);
  });

  it('returns false for all vehicle types', () => {
    expect(isFailed(attemptRegistration({ type: 'sedan' }))).toBe(false);
    expect(isFailed(attemptRegistration({ type: 'coupe' }))).toBe(false);
    expect(isFailed(attemptRegistration({ type: 'mini-van' }))).toBe(false);
    expect(isFailed(attemptRegistration({ type: 'motorcycle' }))).toBe(false);
  });
});
