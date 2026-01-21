import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { VehicleFormInput } from '@/validations/schemas';
import { Select } from '@/components/ui/Select';

interface MiniVanFieldsProps {
  register: UseFormRegister<VehicleFormInput>;
  errors: FieldErrors<VehicleFormInput>;
  watch: UseFormWatch<VehicleFormInput>;
}

export function MiniVanFields({ register, errors, watch }: MiniVanFieldsProps) {
  const doors = watch('doors') || 4;

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
          { value: '3', label: '3 wheels' },
          { value: '4', label: '4 wheels' },
        ]}
      />

      <Select
        label="Doors"
        {...register('doors', { valueAsNumber: true })}
        error={errors.doors?.message}
        options={[
          { value: '0', label: '0 doors' },
          { value: '1', label: '1 door' },
          { value: '2', label: '2 doors' },
          { value: '3', label: '3 doors' },
          { value: '4', label: '4 doors' },
        ]}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Door Configuration</label>
        <div className="space-y-2">
          {Array.from({ length: Number(doors) || 0 }, (_, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Door {index + 1}:</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register(`doorConfig.${index}.sliding` as const)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Sliding</span>
              </label>
            </div>
          ))}
        </div>
        {errors.doorConfig && (
          <p className="text-sm text-red-600">{errors.doorConfig.message}</p>
        )}
      </div>

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
