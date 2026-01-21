import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { VehicleFormInput } from '@/validations/schemas';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface CoupeFieldsProps {
  register: UseFormRegister<VehicleFormInput>;
  errors: FieldErrors<VehicleFormInput>;
}

export function CoupeFields({ register, errors }: CoupeFieldsProps) {
  return (
    <>
      <Select
        label="Wheels"
        {...register('wheels', { valueAsNumber: true })}
        error={(errors as any).wheels?.message}
        options={[
          { value: '0', label: '0 wheels' },
          { value: '1', label: '1 wheel' },
          { value: '2', label: '2 wheels' },
          { value: '3', label: '3 wheels' },
          { value: '4', label: '4 wheels' },
        ]}
      />

      <Select
        label="Doors"
        {...register('doors', { valueAsNumber: true })}
        error={(errors as any).doors?.message}
        options={[
          { value: '0', label: '0 doors' },
          { value: '1', label: '1 door' },
          { value: '2', label: '2 doors' },
        ]}
      />

      <Select
        label="Engine Status"
        {...register('engineStatus')}
        error={(errors as any).engineStatus?.message}
        options={[
          { value: 'works', label: 'Works' },
          { value: 'fixable', label: 'Fixable' },
          { value: 'junk', label: 'Junk' },
        ]}
      />
    </>
  );
}
