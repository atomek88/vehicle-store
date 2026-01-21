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
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">Edit Vehicle</h1>
              <p className="mt-3 text-lg text-gray-600">{vehicle.nickname}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
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

        <div className="flex justify-start">
          <Button variant="ghost" onClick={() => router.push('/vehicles')}>
            ← Back to Vehicles
          </Button>
        </div>
      </div>
    </div>
  );
}
