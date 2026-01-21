'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/use-vehicles';
import { useToast } from '@/hooks/use-toast';
import { VehicleTable } from '@/components/vehicle/VehicleTable';
import { FiltersBar } from '@/components/vehicle/FiltersBar';
import { VehicleForm } from '@/components/vehicle/VehicleForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Select } from '@/components/ui/Select';
import { VehicleSorting } from '@/types';

export default function VehiclesPage() {
  const router = useRouter();
  const { state, filteredVehicles, setFilters, resetFilters, setSorting, createVehicle, deleteVehicle } = useVehicles();
  const { showToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vehicleId: string | null }>({
    isOpen: false,
    vehicleId: null,
  });

  const handleDelete = async () => {
    if (!deleteConfirm.vehicleId) return;

    const result = await deleteVehicle(deleteConfirm.vehicleId);

    if (result.ok) {
      showToast('success', 'Vehicle deleted successfully');
    } else {
      showToast('error', result.error);
    }

    setDeleteConfirm({ isOpen: false, vehicleId: null });
  };

  const handleSortChange = (value: string) => {
    const [key, direction] = value.split('-') as [VehicleSorting['key'], VehicleSorting['direction']];
    setSorting({ key, direction });
  };

  const handleSeedData = async () => {
    const seedVehicles = [
      {
        type: 'sedan' as const,
        nickname: 'Family Sedan',
        mileage: 50000,
        wheels: 4,
        doors: 4,
        engineStatus: 'works' as const,
      },
      {
        type: 'coupe' as const,
        nickname: 'Sports Coupe',
        mileage: 25000,
        wheels: 4,
        doors: 2,
        engineStatus: 'fixable' as const,
      },
      {
        type: 'mini-van' as const,
        nickname: 'Cargo Van',
        mileage: 150000,
        wheels: 4,
        doors: 4,
        doorConfig: [{ sliding: true }, { sliding: true }, { sliding: false }, { sliding: false }],
        engineStatus: 'junk' as const,
      },
      {
        type: 'motorcycle' as const,
        nickname: 'Speed Bike',
        mileage: 15000,
        wheels: 2,
        seatStatus: 'works' as const,
        engineStatus: 'works' as const,
      },
      {
        type: 'sedan' as const,
        nickname: 'Old Sedan',
        mileage: 200000,
        wheels: 4,
        doors: 4,
        engineStatus: 'junk' as const,
      },
    ];

    for (const vehicleData of seedVehicles) {
      const result = await createVehicle(vehicleData);
      if (!result.ok) {
        showToast('error', `Failed to seed vehicle: ${result.error}`);
        return;
      }
    }
    
    showToast('success', `Seeded ${seedVehicles.length} vehicles successfully`);
  };

  if (state.hydrationStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading vehicles...</p>
      </div>
    );
  }

  if (state.hydrationStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading vehicles</p>
          <p className="mt-2 text-sm text-gray-500">{state.hydrationError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">Vehicle Management</h1>
              <p className="mt-3 text-lg text-gray-600">
                Manage your vehicle inventory ({filteredVehicles.length} of {state.vehicles.length} vehicles)
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-md" size="lg">
                Create Vehicle
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-6">

            {/* Filters Section */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <FiltersBar
                filters={state.filters}
                onFiltersChange={setFilters}
                onReset={resetFilters}
                onSeedData={handleSeedData}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <Select
                  options={[
                    { value: 'createdAt-desc', label: 'Newest First' },
                    { value: 'createdAt-asc', label: 'Oldest First' },
                    { value: 'nickname-asc', label: 'Nickname (A-Z)' },
                    { value: 'nickname-desc', label: 'Nickname (Z-A)' },
                    { value: 'mileage-asc', label: 'Mileage (Low to High)' },
                    { value: 'mileage-desc', label: 'Mileage (High to Low)' },
                  ]}
                  value={`${state.sorting.key}-${state.sorting.direction}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <VehicleTable
          vehicles={filteredVehicles}
          onView={(id) => router.push(`/vehicles/${id}`)}
          onEdit={(id) => router.push(`/vehicles/${id}/edit`)}
          onDelete={(id) => setDeleteConfirm({ isOpen: true, vehicleId: id })}
        />

        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">Create New Vehicle</h2>
              <VehicleForm
                onSubmit={async (data) => {
                  const result = await createVehicle(data);
                  if (result.ok) {
                    showToast('success', 'Vehicle created successfully');
                    setIsCreateModalOpen(false);
                  } else {
                    showToast('error', result.error);
                  }
                }}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, vehicleId: null })}
          onConfirm={handleDelete}
          title="Delete Vehicle"
          message="Are you sure you want to delete this vehicle? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
}
