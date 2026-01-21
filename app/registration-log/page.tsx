'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/use-vehicles';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Vehicle } from '@/types';

export default function RegistrationLogPage() {
  const router = useRouter();
  const { state } = useVehicles();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'failed'>('all');

  const filteredVehicles = state.vehicles.filter((vehicle) => {
    const matchesSearch =
      searchQuery === '' ||
      vehicle.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.registration.status === 'registered' &&
        vehicle.registration.registrationId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || vehicle.registration.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = {
    total: state.vehicles.length,
    registered: state.vehicles.filter((v) => v.registration.status === 'registered').length,
    failed: state.vehicles.filter((v) => v.registration.status === 'failed').length,
  };

  if (state.hydrationStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading registration log...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registration Log</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and track vehicle registration status
              </p>
            </div>
            <Button onClick={() => router.push('/vehicles')}>Back to Vehicles</Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard label="Total Vehicles" value={stats.total} variant="neutral" />
            <StatCard label="Registered" value={stats.registered} variant="success" />
            <StatCard label="Failed" value={stats.failed} variant="error" />
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Search"
              placeholder="Search by nickname or registration ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Filter by Status
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'registered' ? 'primary' : 'secondary'}
                  onClick={() => setStatusFilter('registered')}
                >
                  Registered
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'failed' ? 'primary' : 'secondary'}
                  onClick={() => setStatusFilter('failed')}
                >
                  Failed
                </Button>
              </div>
            </div>
          </div>
        </div>

        {sortedVehicles.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No vehicles found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Registration ID / Error
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {vehicle.registration.status === 'registered' ? (
                          <span className="font-mono text-gray-900">
                            {vehicle.registration.registrationId}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {vehicle.registration.registrationError}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">{vehicle.nickname}</div>
                          <div className="capitalize text-gray-500">{vehicle.type}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Badge
                          variant={
                            vehicle.registration.status === 'registered' ? 'success' : 'error'
                          }
                        >
                          {vehicle.registration.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(vehicle.createdAt).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: 'success' | 'error' | 'neutral';
}) {
  const bgColor = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    neutral: 'bg-blue-50',
  }[variant];

  const textColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    neutral: 'text-blue-600',
  }[variant];

  return (
    <div className={`overflow-hidden rounded-lg ${bgColor} px-4 py-5 shadow sm:p-6`}>
      <dt className="truncate text-sm font-medium text-gray-500">{label}</dt>
      <dd className={`mt-1 text-3xl font-semibold tracking-tight ${textColor}`}>{value}</dd>
    </div>
  );
}
