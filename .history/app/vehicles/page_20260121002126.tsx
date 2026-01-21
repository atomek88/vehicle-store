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
        {/* Header Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Vehicle Management</h1>
              <p className="mt-2 text-base text-gray-600">
                Manage your vehicle inventory ({filteredVehicles.length} of {state.vehicles.length} vehicles)
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-md">
              Create Vehicle
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <FiltersBar
            filters={state.filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
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
