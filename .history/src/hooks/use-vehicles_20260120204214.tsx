'use client';

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { Vehicle, VehicleState, VehicleFilters, VehicleSorting, HydrationStatus } from '@/types';
import { storageRepository } from '@/lib/storage';
import { vehicleService } from '@/lib/vehicle-service';
import { VehicleFormInput } from '@/validations/schemas';

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

type VehicleAction =
  | { type: 'HYDRATE_START' }
  | { type: 'HYDRATE_SUCCESS'; payload: Vehicle[] }
  | { type: 'HYDRATE_ERROR'; payload: string }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<VehicleFilters> }
  | { type: 'SET_SORTING'; payload: VehicleSorting }
  | { type: 'RESET_FILTERS' };

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════

const initialFilters: VehicleFilters = {
  query: '',
  types: [],
  registrationStatuses: [],
  engineStatuses: [],
};

const initialSorting: VehicleSorting = {
  key: 'createdAt',
  direction: 'desc',
};

const initialState: VehicleState = {
  vehicles: [],
  filters: initialFilters,
  sorting: initialSorting,
  hydrationStatus: 'idle',
};

// ═══════════════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════════════

function vehicleReducer(state: VehicleState, action: VehicleAction): VehicleState {
  switch (action.type) {
    case 'HYDRATE_START':
      return {
        ...state,
        hydrationStatus: 'loading',
        hydrationError: undefined,
      };

    case 'HYDRATE_SUCCESS':
      return {
        ...state,
        vehicles: action.payload,
        hydrationStatus: 'ready',
        hydrationError: undefined,
      };

    case 'HYDRATE_ERROR':
      return {
        ...state,
        hydrationStatus: 'error',
        hydrationError: action.payload,
      };

    case 'ADD_VEHICLE':
      return {
        ...state,
        vehicles: [...state.vehicles, action.payload],
      };

    case 'UPDATE_VEHICLE': {
      const updatedVehicles = state.vehicles.map((v) =>
        v.id === action.payload.id ? action.payload : v
      );
      return {
        ...state,
        vehicles: updatedVehicles,
      };
    }

    case 'DELETE_VEHICLE': {
      const filteredVehicles = state.vehicles.filter((v) => v.id !== action.payload);
      return {
        ...state,
        vehicles: filteredVehicles,
      };
    }

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialFilters,
      };

    case 'SET_SORTING':
      return {
        ...state,
        sorting: action.payload,
      };

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface VehicleContextValue {
  state: VehicleState;
  filteredVehicles: Vehicle[];
  createVehicle: (input: VehicleFormInput) => Promise<{ ok: true; vehicle: Vehicle } | { ok: false; error: string }>;
  updateVehicle: (id: string, input: VehicleFormInput) => Promise<{ ok: true; vehicle: Vehicle } | { ok: false; error: string }>;
  deleteVehicle: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  setFilters: (filters: Partial<VehicleFilters>) => void;
  resetFilters: () => void;
  setSorting: (sorting: VehicleSorting) => void;
}

const VehicleContext = createContext<VehicleContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(vehicleReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'HYDRATE_START' });

    const loadResult = storageRepository.load();

    if (loadResult.ok) {
      dispatch({ type: 'HYDRATE_SUCCESS', payload: loadResult.value });
    } else {
      dispatch({ type: 'HYDRATE_ERROR', payload: loadResult.error.message });
    }
  }, []);

  // Persist to localStorage whenever vehicles change
  useEffect(() => {
    if (state.hydrationStatus === 'ready') {
      storageRepository.save(state.vehicles);
    }
  }, [state.vehicles, state.hydrationStatus]);

  // Memoized filtered and sorted vehicles
  const filteredVehicles = useMemo(() => {
    let result = [...state.vehicles];

    // Apply filters
    const { query, types, registrationStatuses, engineStatuses } = state.filters;

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter((v) =>
        v.nickname.toLowerCase().includes(lowerQuery) ||
        v.type.toLowerCase().includes(lowerQuery) ||
        (v.registration.status === 'registered' && v.registration.registrationId.toLowerCase().includes(lowerQuery))
      );
    }

    if (types.length > 0) {
      result = result.filter((v) => types.includes(v.type));
    }

    if (registrationStatuses.length > 0) {
      result = result.filter((v) => registrationStatuses.includes(v.registration.status));
    }

    if (engineStatuses.length > 0) {
      result = result.filter((v) => engineStatuses.includes(v.engineStatus));
    }

    // Apply sorting
    const { key, direction } = state.sorting;

    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (key) {
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'nickname':
          aValue = a.nickname.toLowerCase();
          bValue = b.nickname.toLowerCase();
          break;
        case 'mileage':
          aValue = a.mileage;
          bValue = b.mileage;
          break;
        default: {
          const _exhaustive: never = key;
          return _exhaustive;
        }
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [state.vehicles, state.filters, state.sorting]);

  // Actions
  const createVehicle = useCallback(async (input: VehicleFormInput) => {
    const result = vehicleService.createVehicle(input, state.vehicles);

    if (result.ok) {
      dispatch({ type: 'ADD_VEHICLE', payload: result.value });
      return { ok: true as const, vehicle: result.value };
    } else {
      return { ok: false as const, error: result.error.message };
    }
  }, [state.vehicles]);

  const updateVehicle = useCallback(async (id: string, input: VehicleFormInput) => {
    const result = vehicleService.updateVehicle(id, input, state.vehicles);

    if (result.ok) {
      dispatch({ type: 'UPDATE_VEHICLE', payload: result.value });
      return { ok: true as const, vehicle: result.value };
    } else {
      return { ok: false as const, error: result.error.message };
    }
  }, [state.vehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    const result = vehicleService.deleteVehicle(id, state.vehicles);

    if (result.ok) {
      dispatch({ type: 'DELETE_VEHICLE', payload: id });
      return { ok: true as const };
    } else {
      return { ok: false as const, error: result.error.message };
    }
  }, [state.vehicles]);

  const setFilters = useCallback((filters: Partial<VehicleFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const setSorting = useCallback((sorting: VehicleSorting) => {
    dispatch({ type: 'SET_SORTING', payload: sorting });
  }, []);

  const value: VehicleContextValue = {
    state,
    filteredVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    setFilters,
    resetFilters,
    setSorting,
  };

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useVehicles() {
  const context = useContext(VehicleContext);

  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }

  return context;
}
