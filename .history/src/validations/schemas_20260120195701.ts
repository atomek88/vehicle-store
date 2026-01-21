import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVE SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const NicknameSchema = z
  .string()
  .min(1, 'Nickname is required')
  .max(50, 'Nickname must be 50 characters or fewer')
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, 'Nickname cannot be only whitespace');

export const MileageSchema = z
  .number({ invalid_type_error: 'Mileage must be a number' })
  .int('Mileage must be a whole number')
  .nonnegative('Mileage cannot be negative');

export const EngineStatusSchema = z.enum(['works', 'fixable', 'junk']);

export const SeatStatusSchema = z.enum(['works', 'fixable', 'junk']);

// ═══════════════════════════════════════════════════════════════════════════
// VEHICLE-SPECIFIC SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

// Wheels: 0-4 for cars, 0-2 for motorcycles
export const CarWheelsSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const MotorcycleWheelsSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);

// Doors: 0-4 for sedans/mini-vans, 0-2 for coupes
export const SedanDoorsSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const CoupeDoorsSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);

// Door configuration for mini-vans
export const DoorConfigItemSchema = z.object({
  sliding: z.boolean(),
});

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const RegistrationSuccessSchema = z.object({
  status: z.literal('registered'),
  registrationId: z.string().min(1),
});

export const RegistrationFailedSchema = z.object({
  status: z.literal('failed'),
  registrationError: z.string().min(1),
});

export const RegistrationSchema = z.discriminatedUnion('status', [
  RegistrationSuccessSchema,
  RegistrationFailedSchema,
]);

// ═══════════════════════════════════════════════════════════════════════════
// FORM INPUT SCHEMAS (Before defaults applied)
// ═══════════════════════════════════════════════════════════════════════════

export const SedanFormInputSchema = z.object({
  type: z.literal('sedan'),
  nickname: NicknameSchema,
  mileage: MileageSchema,
  wheels: CarWheelsSchema.optional(),
  doors: SedanDoorsSchema.optional(),
  engineStatus: EngineStatusSchema.optional(),
});

export const CoupeFormInputSchema = z.object({
  type: z.literal('coupe'),
  nickname: NicknameSchema,
  mileage: MileageSchema,
  wheels: CarWheelsSchema.optional(),
  doors: CoupeDoorsSchema.optional(),
  engineStatus: EngineStatusSchema.optional(),
});

export const MiniVanFormInputSchema = z.object({
  type: z.literal('mini-van'),
  nickname: NicknameSchema,
  mileage: MileageSchema,
  wheels: CarWheelsSchema.optional(),
  doors: SedanDoorsSchema.optional(),
  doorConfig: z.array(DoorConfigItemSchema).optional(),
  engineStatus: EngineStatusSchema.optional(),
});

export const MotorcycleFormInputSchema = z.object({
  type: z.literal('motorcycle'),
  nickname: NicknameSchema,
  mileage: MileageSchema,
  wheels: MotorcycleWheelsSchema.optional(),
  seatStatus: SeatStatusSchema.optional(),
  engineStatus: EngineStatusSchema.optional(),
});

export const VehicleFormInputSchema = z.discriminatedUnion('type', [
  SedanFormInputSchema,
  CoupeFormInputSchema,
  MiniVanFormInputSchema,
  MotorcycleFormInputSchema,
]);

export type VehicleFormInput = z.infer<typeof VehicleFormInputSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTED SCHEMAS (Full validation with all fields required)
// ═══════════════════════════════════════════════════════════════════════════

const VehicleBaseSchema = z.object({
  id: z.string().uuid(),
  nickname: NicknameSchema,
  mileage: MileageSchema,
  engineStatus: EngineStatusSchema,
  registration: RegistrationSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SedanPersistedSchema = VehicleBaseSchema.extend({
  type: z.literal('sedan'),
  wheels: CarWheelsSchema,
  doors: SedanDoorsSchema,
});

export const CoupePersistedSchema = VehicleBaseSchema.extend({
  type: z.literal('coupe'),
  wheels: CarWheelsSchema,
  doors: CoupeDoorsSchema,
});

export const MiniVanPersistedSchema = VehicleBaseSchema.extend({
  type: z.literal('mini-van'),
  wheels: CarWheelsSchema,
  doors: SedanDoorsSchema,
  doorConfig: z.array(DoorConfigItemSchema),
}).superRefine((val, ctx) => {
  if (val.doorConfig.length !== val.doors) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `doorConfig length (${val.doorConfig.length}) must equal doors (${val.doors})`,
      path: ['doorConfig'],
    });
  }
});

export const MotorcyclePersistedSchema = VehicleBaseSchema.extend({
  type: z.literal('motorcycle'),
  wheels: MotorcycleWheelsSchema,
  seatStatus: SeatStatusSchema,
});

export const VehiclePersistedSchema = z.discriminatedUnion('type', [
  SedanPersistedSchema,
  CoupePersistedSchema,
  MiniVanPersistedSchema,
  MotorcyclePersistedSchema,
]);

export type VehiclePersisted = z.infer<typeof VehiclePersistedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const StorageSchemaV1 = z.object({
  version: z.literal(1),
  vehicles: z.array(VehiclePersistedSchema),
});

export type StorageData = z.infer<typeof StorageSchemaV1>;
