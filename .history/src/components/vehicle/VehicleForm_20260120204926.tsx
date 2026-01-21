'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VehicleFormInput, VehicleFormInputSchema } from '@/validations/schemas';
import { Vehicle } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SedanFields } from './SedanFields';
import { CoupeFields } from './CoupeFields';
import { MiniVanFields } from './MiniVanFields';
import { MotorcycleFields } from './MotorcycleFields';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: VehicleFormInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function VehicleForm({ vehicle, onSubmit, onCancel, isSubmitting = false }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VehicleFormInput>({
    resolver: zodResolver(VehicleFormInputSchema),
    defaultValues: vehicle
      ? {
          type: vehicle.type,
          nickname: vehicle.nickname,
          mileage: vehicle.mileage,
          wheels: vehicle.wheels,
          doors: vehicle.type === 'sedan' || vehicle.type === 'coupe' || vehicle.type === 'mini-van' ? vehicle.doors : undefined,
          doorConfig: vehicle.type === 'mini-van' ? vehicle.doorConfig : undefined,
          seatStatus: vehicle.type === 'motorcycle' ? vehicle.seatStatus : undefined,
          engineStatus: vehicle.engineStatus,
        }
      : {
          type: 'sedan',
          mileage: 0,
        },
  });

  const selectedType = watch('type');

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'sedan':
        return <SedanFields register={register} errors={errors} />;
      case 'coupe':
        return <CoupeFields register={register} errors={errors} />;
      case 'mini-van':
        return <MiniVanFields register={register} errors={errors} watch={watch} />;
      case 'motorcycle':
        return <MotorcycleFields register={register} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Select
          label="Vehicle Type"
          {...register('type')}
          error={errors.type?.message}
          options={[
            { value: 'sedan', label: 'Sedan' },
            { value: 'coupe', label: 'Coupe' },
            { value: 'mini-van', label: 'Mini Van' },
            { value: 'motorcycle', label: 'Motorcycle' },
          ]}
          disabled={!!vehicle}
        />

        <Input
          label="Nickname"
          {...register('nickname')}
          error={errors.nickname?.message}
          placeholder="Enter vehicle nickname"
        />

        <Input
          label="Mileage"
          type="number"
          {...register('mileage', { valueAsNumber: true })}
          error={errors.mileage?.message}
          placeholder="Enter mileage"
        />

        {renderTypeSpecificFields()}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Create Vehicle'}
        </Button>
      </div>
    </form>
  );
}
