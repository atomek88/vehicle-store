'use client';

import { Badge } from '@/components/ui/Badge';
import { Vehicle, Sedan, Coupe, MiniVan, Motorcycle } from '@/types';

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
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

  const getRegistrationBadge = (vehicle: Vehicle) => {
    if (vehicle.registration.status === 'registered') {
      return <Badge variant="success">Registered</Badge>;
    } else {
      return <Badge variant="error">Failed</Badge>;
    }
  };

  const renderTypeSpecificFields = (vehicle: Vehicle) => {
    switch (vehicle.type) {
      case 'sedan': {
        const sedan = vehicle as Sedan;
        return (
          <>
            <DetailField label="Wheels" value={`${sedan.wheels} wheels`} />
            <DetailField label="Doors" value={`${sedan.doors} doors`} />
          </>
        );
      }
      case 'coupe': {
        const coupe = vehicle as Coupe;
        return (
          <>
            <DetailField label="Wheels" value={`${coupe.wheels} wheels`} />
            <DetailField label="Doors" value={`${coupe.doors} doors`} />
          </>
        );
      }
      case 'mini-van': {
        const miniVan = vehicle as MiniVan;
        return (
          <>
            <DetailField label="Wheels" value={`${miniVan.wheels} wheels`} />
            <DetailField label="Doors" value={`${miniVan.doors} doors`} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Door Configuration</label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <ul className="space-y-2 text-sm text-gray-900">
                  {miniVan.doorConfig.map((door, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="font-medium">Door {index + 1}:</span>
                      <span>{door.sliding ? 'Sliding' : 'Regular'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        );
      }
      case 'motorcycle': {
        const motorcycle = vehicle as Motorcycle;
        return (
          <>
            <DetailField label="Wheels" value={`${motorcycle.wheels} wheels`} />
            <DetailField
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
                  {motorcycle.seatStatus.charAt(0).toUpperCase() + motorcycle.seatStatus.slice(1)}
                </Badge>
              }
            />
          </>
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <DetailField label="Vehicle Type" value={<span className="capitalize">{vehicle.type}</span>} />
      <DetailField label="Nickname" value={vehicle.nickname} />
      <DetailField label="Mileage" value={`${vehicle.mileage.toLocaleString()} miles`} />
      
      {renderTypeSpecificFields(vehicle)}

      <DetailField label="Engine Status" value={getEngineBadge(vehicle.engineStatus)} />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Registration Status</label>
        <div className="flex flex-col gap-2">
          {getRegistrationBadge(vehicle)}
          {vehicle.registration.status === 'registered' ? (
            <p className="font-mono text-sm text-gray-600">{vehicle.registration.registrationId}</p>
          ) : (
            <p className="text-sm text-red-600">{vehicle.registration.registrationError}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          System Information
        </h3>
        <div className="space-y-4">
          <DetailField label="Created" value={new Date(vehicle.createdAt).toLocaleString()} />
          <DetailField label="Last Updated" value={new Date(vehicle.updatedAt).toLocaleString()} />
          <DetailField label="Vehicle ID" value={<span className="font-mono text-xs text-gray-500">{vehicle.id}</span>} />
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}
