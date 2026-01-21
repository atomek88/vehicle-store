'use client';

import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function VehicleTable({ vehicles, onEdit, onDelete, onView }: VehicleTableProps) {
  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No vehicles found. Create your first vehicle to get started.</p>
      </div>
    );
  }

  const getRegistrationBadge = (vehicle: Vehicle) => {
    if (vehicle.registration.status === 'registered') {
      return (
        <Badge variant="success">
          {vehicle.registration.registrationId}
        </Badge>
      );
    } else {
      return <Badge variant="error">Failed</Badge>;
    }
  };

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

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <caption className="sr-only">
          List of vehicles with their details and available actions
        </caption>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Nickname
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Mileage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Registration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Engine Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                <span className="capitalize">{vehicle.type}</span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {vehicle.nickname}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {vehicle.mileage.toLocaleString()} mi
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {getRegistrationBadge(vehicle)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {getEngineBadge(vehicle.engineStatus)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onView(vehicle.id)} aria-label={`View ${vehicle.nickname} details`}>
                    View
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onEdit(vehicle.id)} aria-label={`Edit ${vehicle.nickname} details`}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(vehicle.id)} aria-label={`Delete ${vehicle.nickname} permanently`}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>)
  );
}
