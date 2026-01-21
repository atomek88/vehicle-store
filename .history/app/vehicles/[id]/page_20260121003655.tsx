'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/use-vehicles';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { VehicleDetails } from '@/components/vehicle/VehicleDetails';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { state, deleteVehicle } = useVehicles();
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const vehicle = state.vehicles.find((v) => v.id === id);

  const handleDelete = async () => {
    const result = await deleteVehicle(id);

    if (result.ok) {
      showToast('success', 'Vehicle deleted successfully');
      router.push('/vehicles');
    } else {
      showToast('error', result.error);
    }
  };

  if (state.hydrationStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Not Found</h1>
          <p className="mt-2 text-gray-600">The vehicle you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => router.push('/vehicles')}>
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">View Vehicle</h1>
              <p className="mt-3 text-lg text-gray-600">{vehicle.nickname}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => router.push(`/vehicles/${id}/edit`)}>
                Edit Vehicle
              </Button>
              <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <VehicleDetails vehicle={vehicle} />
        </div>

        <div className="flex justify-start">
          <Button variant="ghost" onClick={() => router.push('/vehicles')}>
            ← Back to Vehicles
          </Button>
        </div>

        <ConfirmDialog
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Vehicle"
          message={`Are you sure you want to delete "${vehicle.nickname}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
}
