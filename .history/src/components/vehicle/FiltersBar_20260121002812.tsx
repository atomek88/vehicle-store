'use client';

import { VehicleFilters, VehicleType, EngineStatus } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface FiltersBarProps {
  filters: VehicleFilters;
  onFiltersChange: (filters: Partial<VehicleFilters>) => void;
  onReset: () => void;
  onSeedData: () => void;
}

export function FiltersBar({ filters, onFiltersChange, onReset }: FiltersBarProps) {
  const vehicleTypes: VehicleType[] = ['sedan', 'coupe', 'mini-van', 'motorcycle'];
  const engineStatuses: EngineStatus[] = ['works', 'fixable', 'junk'];

  return (
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Search by nickname or registration ID..."
          value={filters.query}
          onChange={(e) => onFiltersChange({ query: e.target.value })}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Vehicle Types</label>
          <div className="space-y-2">
            {vehicleTypes.map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.types, type]
                      : filters.types.filter((t) => t !== type);
                    onFiltersChange({ types: newTypes });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Engine Status</label>
          <div className="space-y-2">
            {engineStatuses.map((status) => (
              <label key={status} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.engineStatuses.includes(status)}
                  onChange={(e) => {
                    const newStatuses = e.target.checked
                      ? [...filters.engineStatuses, status]
                      : filters.engineStatuses.filter((s) => s !== status);
                    onFiltersChange({ engineStatuses: newStatuses });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Registration Status</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.registrationStatuses.includes('registered')}
                onChange={(e) => {
                  const newStatuses = e.target.checked
                    ? [...filters.registrationStatuses, 'registered' as const]
                    : filters.registrationStatuses.filter((s) => s !== 'registered');
                  onFiltersChange({ registrationStatuses: newStatuses });
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Registered</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.registrationStatuses.includes('failed')}
                onChange={(e) => {
                  const newStatuses = e.target.checked
                    ? [...filters.registrationStatuses, 'failed' as const]
                    : filters.registrationStatuses.filter((s) => s !== 'failed');
                  onFiltersChange({ registrationStatuses: newStatuses });
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Failed</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
        <Button variant="secondary" size="sm" onClick={onReset} className="shadow-sm">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
