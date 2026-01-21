'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/use-vehicles';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import { Vehicle, Sedan, Coupe, MiniVan, Motorcycle } from '@/types';

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

  const getEngineBadge = (status: string) => {
    switch (status) {
      case 'works':
        return <Badge variant="success">Works</Badge>;
      case 'fixable':
        return <Badge variant="warning">Fixable</Badge>;
      case 'junk':
        return <Badge variant="error">Junk</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getRegistrationDisplay = (vehicle: Vehicle) => {
    if (vehicle.registration.status === 'registered') {
      return (
        <div>
          <Badge variant="success">Registered</Badge>
          <p className="mt-2 font-mono text-sm text-gray-600">
            {vehicle.registration.registrationId}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <Badge variant="error">Failed</Badge>
          <p className="mt-2 text-sm text-red-600">{vehicle.registration.registrationError}</p>
        </div>
      );
    }
  };

  const renderTypeSpecificFields = (vehicle: Vehicle) => {
    switch (vehicle.type) {
      case 'sedan': {
        const sedan = vehicle as Sedan;
        return (
          <>
            <DetailRow label="Wheels" value={sedan.wheels} />
            <DetailRow label="Doors" value={sedan.doors} />
          </>
        );
      }
      case 'coupe': {
        const coupe = vehicle as Coupe;
        return (
          <>
            <DetailRow label="Wheels" value={coupe.wheels} />
            <DetailRow label="Doors" value={coupe.doors} />
          </>
        );
      }
      case 'mini-van': {
        const miniVan = vehicle as MiniVan;
        return (
          <>
            <DetailRow label="Wheels" value={miniVan.wheels} />
            <DetailRow label="Doors" value={miniVan.doors} />
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Door Configuration</dt>
              <dd className="mt-2 text-sm text-gray-900">
                <ul className="space-y-1">
                  {miniVan.doorConfig.map((door, index) => (
                    <li key={index}>
                      Door {index + 1}: {door.sliding ? 'Sliding' : 'Regular'}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </>
        );
      }
      case 'motorcycle': {
        const motorcycle = vehicle as Motorcycle;
        return (
          <>
            <DetailRow label="Wheels" value={motorcycle.wheels} />
            <DetailRow
              label="Seat Status"
              value={
                <Badge
                  variant={
                    motorcycle.seatStatus === 'works'
                      ? 'success'
                      : motorcycle.seatStatus === 'fixable'
                      ? 'warning'
                      : 'error'
                  }
                >
                  {motorcycle.seatStatus}
                </Badge>
              }
            />
          </>
        );
      }
    }
  };

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
