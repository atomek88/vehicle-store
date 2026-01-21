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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/vehicles')}>
            ← Back to Vehicles
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push(`/vehicles/${id}/edit`)}>
              Edit Vehicle
            </Button>
            <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
              Delete Vehicle
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-white px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.nickname}</h1>
            <p className="mt-1 text-sm text-gray-500 capitalize">{vehicle.type}</p>
          </div>

          <dl className="divide-y divide-gray-200">
            <DetailRow label="Vehicle Type" value={<span className="capitalize">{vehicle.type}</span>} />
            <DetailRow label="Nickname" value={vehicle.nickname} />
            <DetailRow label="Mileage" value={`${vehicle.mileage.toLocaleString()} miles`} />
            
            {renderTypeSpecificFields(vehicle)}

            <DetailRow label="Engine Status" value={getEngineBadge(vehicle.engineStatus)} />
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Registration Status</dt>
              <dd className="mt-2 text-sm text-gray-900">{getRegistrationDisplay(vehicle)}</dd>
            </div>

            <DetailRow
              label="Created"
              value={new Date(vehicle.createdAt).toLocaleString()}
            />
            <DetailRow
              label="Last Updated"
              value={new Date(vehicle.updatedAt).toLocaleString()}
            />
            <DetailRow label="Vehicle ID" value={<span className="font-mono text-xs">{vehicle.id}</span>} />
          </dl>
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-t border-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  );
}
