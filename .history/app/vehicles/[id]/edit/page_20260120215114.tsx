'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/use-vehicles';
import { useToast } from '@/hooks/use-toast';
import { VehicleForm } from '@/components/vehicle/VehicleForm';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditVehiclePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { state, updateVehicle } = useVehicles();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicle = state.vehicles.find((v) => v.id === id);

  if (state.hydrationStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Not Found</h1>
          <p className="mt-2 text-gray-600">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/vehicles')} className="mt-4">
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle</h1>
          <p className="mt-2 text-sm text-gray-600">Update vehicle information</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <VehicleForm
            vehicle={vehicle}
            onSubmit={async (data) => {
              setIsSubmitting(true);
              const result = await updateVehicle(id, data);
              setIsSubmitting(false);

              if (result.ok) {
                showToast('success', 'Vehicle updated successfully');
                router.push('/vehicles');
              } else {
                showToast('error', result.error);
              }
            }}
            onCancel={() => router.push('/vehicles')}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
