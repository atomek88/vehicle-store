import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { VehicleProvider, useVehicles } from './use-vehicles';
import { Vehicle } from '@/types';
import * as storage from '@/lib/storage';

// Mock the storage repository
vi.mock('@/lib/storage', () => ({
  storageRepository: {
    load: vi.fn(),
    save: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('useVehicles', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: [] });
    vi.mocked(storage.storageRepository.save).mockReturnValue({ ok: true, value: undefined });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HYDRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('hydration', () => {
    it('loads vehicles from storage on mount', async () => {
      const mockVehicles: Vehicle[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'sedan',
          nickname: 'Test Sedan',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'SEDAN-ABC' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      expect(result.current.state.vehicles).toEqual(mockVehicles);
      expect(storage.storageRepository.load).toHaveBeenCalledOnce();
    });

    it('handles hydration errors gracefully', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({
        ok: false,
        error: { code: 'STORAGE_ERROR', message: 'Failed to load' },
      });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('error');
      });

      expect(result.current.state.hydrationError).toBe('Failed to load');
      expect(result.current.state.vehicles).toEqual([]);
    });

    it('starts with loading status', () => {
      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      expect(result.current.state.hydrationStatus).toBe('loading');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE VEHICLE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createVehicle', () => {
    it('creates a new vehicle successfully', async () => {
      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      let createResult: Awaited<ReturnType<typeof result.current.createVehicle>>;

      await act(async () => {
        createResult = await result.current.createVehicle({
          type: 'sedan',
          nickname: 'New Sedan',
          mileage: 25000,
        });
      });

      expect(createResult!.ok).toBe(true);
      if (createResult!.ok) {
        expect(createResult.vehicle.nickname).toBe('New Sedan');
        expect(createResult.vehicle.type).toBe('sedan');
      }

      expect(result.current.state.vehicles).toHaveLength(1);
      expect(result.current.state.vehicles[0]?.nickname).toBe('New Sedan');
    });

    it('rejects duplicate nicknames', async () => {
      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      // Create first vehicle
      await act(async () => {
        await result.current.createVehicle({
          type: 'sedan',
          nickname: 'Duplicate',
          mileage: 25000,
        });
      });

      // Try to create duplicate
      let duplicateResult: Awaited<ReturnType<typeof result.current.createVehicle>>;

      await act(async () => {
        duplicateResult = await result.current.createVehicle({
          type: 'coupe',
          nickname: 'Duplicate',
          mileage: 30000,
        });
      });

      expect(duplicateResult!.ok).toBe(false);
      if (!duplicateResult!.ok) {
        expect(duplicateResult.error).toContain('Duplicate');
      }

      expect(result.current.state.vehicles).toHaveLength(1);
    });

    it('persists vehicles to storage after creation', async () => {
      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      await act(async () => {
        await result.current.createVehicle({
          type: 'motorcycle',
          nickname: 'Bike',
          mileage: 10000,
        });
      });

      await waitFor(() => {
        expect(storage.storageRepository.save).toHaveBeenCalled();
      });

      const saveCall = vi.mocked(storage.storageRepository.save).mock.calls[0];
      expect(saveCall?.[0]).toHaveLength(1);
      expect(saveCall?.[0]?.[0]?.nickname).toBe('Bike');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE VEHICLE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('updateVehicle', () => {
    it('updates an existing vehicle', async () => {
      const mockVehicles: Vehicle[] = [
        {
          id: 'test-id',
          type: 'sedan',
          nickname: 'Original',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'SEDAN-ABC' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      let updateResult: Awaited<ReturnType<typeof result.current.updateVehicle>>;

      await act(async () => {
        updateResult = await result.current.updateVehicle('test-id', {
          type: 'sedan',
          nickname: 'Updated',
          mileage: 60000,
        });
      });

      expect(updateResult!.ok).toBe(true);
      if (updateResult!.ok) {
        expect(updateResult.vehicle.nickname).toBe('Updated');
        expect(updateResult.vehicle.mileage).toBe(60000);
      }

      expect(result.current.state.vehicles[0]?.nickname).toBe('Updated');
      expect(result.current.state.vehicles[0]?.mileage).toBe(60000);
    });

    it('returns error for non-existent vehicle', async () => {
      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      let updateResult: Awaited<ReturnType<typeof result.current.updateVehicle>>;

      await act(async () => {
        updateResult = await result.current.updateVehicle('non-existent', {
          type: 'sedan',
          nickname: 'Test',
          mileage: 50000,
        });
      });

      expect(updateResult!.ok).toBe(false);
      if (!updateResult!.ok) {
        expect(updateResult.error).toContain('not found');
      }
    });

    it('preserves registration when updating', async () => {
      const mockVehicles: Vehicle[] = [
        {
          id: 'test-id',
          type: 'sedan',
          nickname: 'Original',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'ORIGINAL-ID' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      await act(async () => {
        await result.current.updateVehicle('test-id', {
          type: 'sedan',
          nickname: 'Updated',
          mileage: 60000,
        });
      });

      expect(result.current.state.vehicles[0]?.registration).toEqual({
        status: 'registered',
        registrationId: 'ORIGINAL-ID',
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE VEHICLE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deleteVehicle', () => {
    it('deletes an existing vehicle', async () => {
      const mockVehicles: Vehicle[] = [
        {
          id: 'test-id',
          type: 'sedan',
          nickname: 'To Delete',
          mileage: 50000,
          wheels: 4,
          doors: 4,
          engineStatus: 'works',
          registration: { status: 'registered', registrationId: 'SEDAN-ABC' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      let deleteResult: Awaited<ReturnType<typeof result.current.deleteVehicle>>;

      await act(async () => {
        deleteResult = await result.current.deleteVehicle('test-id');
      });

      expect(deleteResult!.ok).toBe(true);
      expect(result.current.state.vehicles).toHaveLength(0);
    });

    it('returns error for non-existent vehicle', async () => {
      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      let deleteResult: Awaited<ReturnType<typeof result.current.deleteVehicle>>;

      await act(async () => {
        deleteResult = await result.current.deleteVehicle('non-existent');
      });

      expect(deleteResult!.ok).toBe(false);
      if (!deleteResult!.ok) {
        expect(deleteResult.error).toContain('not found');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTERING TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('filtering', () => {
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        type: 'sedan',
        nickname: 'Red Sedan',
        mileage: 50000,
        wheels: 4,
        doors: 4,
        engineStatus: 'works',
        registration: { status: 'registered', registrationId: 'SEDAN-001' },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        type: 'coupe',
        nickname: 'Blue Coupe',
        mileage: 25000,
        wheels: 4,
        doors: 2,
        engineStatus: 'fixable',
        registration: { status: 'registered', registrationId: 'COUPE-002' },
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
      {
        id: '3',
        type: 'motorcycle',
        nickname: 'Fast Bike',
        mileage: 10000,
        wheels: 2,
        seatStatus: 'works',
        engineStatus: 'junk',
        registration: { status: 'registered', registrationId: 'MOTO-003' },
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
    ];

    it('filters by query (nickname)', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      act(() => {
        result.current.setFilters({ query: 'blue' });
      });

      expect(result.current.filteredVehicles).toHaveLength(1);
      expect(result.current.filteredVehicles[0]?.nickname).toBe('Blue Coupe');
    });

    it('filters by vehicle type', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      act(() => {
        result.current.setFilters({ types: ['sedan', 'coupe'] });
      });

      expect(result.current.filteredVehicles).toHaveLength(2);
      expect(result.current.filteredVehicles.find((v) => v.type === 'motorcycle')).toBeUndefined();
    });

    it('filters by engine status', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      act(() => {
        result.current.setFilters({ engineStatuses: ['works'] });
      });

      expect(result.current.filteredVehicles).toHaveLength(1);
      expect(result.current.filteredVehicles[0]?.nickname).toBe('Red Sedan');
    });

    it('combines multiple filters', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      act(() => {
        result.current.setFilters({
          types: ['sedan', 'coupe'],
          engineStatuses: ['works'],
        });
      });

      expect(result.current.filteredVehicles).toHaveLength(1);
      expect(result.current.filteredVehicles[0]?.nickname).toBe('Red Sedan');
    });

    it('resets filters', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      act(() => {
        result.current.setFilters({ query: 'blue', types: ['coupe'] });
      });

      expect(result.current.filteredVehicles).toHaveLength(1);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filteredVehicles).toHaveLength(3);
      expect(result.current.state.filters.query).toBe('');
      expect(result.current.state.filters.types).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SORTING TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('sorting', () => {
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        type: 'sedan',
        nickname: 'Zebra',
        mileage: 100000,
        wheels: 4,
        doors: 4,
        engineStatus: 'works',
        registration: { status: 'registered', registrationId: 'SEDAN-001' },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        type: 'coupe',
        nickname: 'Apple',
        mileage: 50000,
        wheels: 4,
        doors: 2,
        engineStatus: 'works',
        registration: { status: 'registered', registrationId: 'COUPE-002' },
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
      {
        id: '3',
        type: 'motorcycle',
        nickname: 'Mango',
        mileage: 25000,
        wheels: 2,
        seatStatus: 'works',
        engineStatus: 'works',
        registration: { status: 'registered', registrationId: 'MOTO-003' },
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    ];

    it('sorts by nickname ascending', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      act(() => {
        result.current.setSorting({ key: 'nickname', direction: 'asc' });
      });

      expect(result.current.filteredVehicles[0]?.nickname).toBe('Apple');
      expect(result.current.filteredVehicles[1]?.nickname).toBe('Mango');
      expect(result.current.filteredVehicles[2]?.nickname).toBe('Zebra');
    });

    it('sorts by mileage descending', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      act(() => {
        result.current.setSorting({ key: 'mileage', direction: 'desc' });
      });

      expect(result.current.filteredVehicles[0]?.mileage).toBe(100000);
      expect(result.current.filteredVehicles[1]?.mileage).toBe(50000);
      expect(result.current.filteredVehicles[2]?.mileage).toBe(25000);
    });

    it('sorts by createdAt descending (default)', async () => {
      vi.mocked(storage.storageRepository.load).mockReturnValue({ ok: true, value: mockVehicles });

      const { result } = renderHook(() => useVehicles(), {
        wrapper: VehicleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.hydrationStatus).toBe('ready');
      });

      // Default sorting is createdAt desc
      expect(result.current.filteredVehicles[0]?.id).toBe('2'); // 2024-01-03
      expect(result.current.filteredVehicles[1]?.id).toBe('3'); // 2024-01-02
      expect(result.current.filteredVehicles[2]?.id).toBe('1'); // 2024-01-01
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('error handling', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useVehicles());
      }).toThrow('useVehicles must be used within a VehicleProvider');
    });
  });
});
