import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { VehicleFormInput } from '@/validations/schemas';
import { Select } from '@/components/ui/Select';

interface MotorcycleFieldsProps {
  register: UseFormRegister<VehicleFormInput>;
  errors: FieldErrors<VehicleFormInput>;
}

export function MotorcycleFields({ register, errors }: MotorcycleFieldsProps) {
  return (
    <>
      <Select
        label="Wheels"
        {...register('wheels', { valueAsNumber: true })}
        error={errors.wheels?.message}
        options={[
          { value: '0', label: '0 wheels' },
          { value: '1', label: '1 wheel' },
          { value: '2', label: '2 wheels' },
        ]}
      />

      <Select
        label="Seat Status"
        {...register('seatStatus')}
        error={errors.seatStatus?.message}
        options={[
          { value: 'works', label: 'Works' },
          { value: 'fixable', label: 'Fixable' },
          { value: 'junk', label: 'Junk' },
        ]}
      />

      <Select
        label="Engine Status"
        {...register('engineStatus')}
        error={errors.engineStatus?.message}
        options={[
          { value: 'works', label: 'Works' },
          { value: 'fixable', label: 'Fixable' },
          { value: 'junk', label: 'Junk' },
        ]}
      />
    </>
  );
}
