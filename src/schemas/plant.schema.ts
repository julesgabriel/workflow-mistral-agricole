import { z } from 'zod';

// Disease enum schema
export const DiseaseSchema = z.enum(['Mildew', 'Powdery Mildew', 'Healthy']);
export type Disease = z.infer<typeof DiseaseSchema>;

// PlantId schema - non-empty string
export const PlantIdSchema = z.string().min(1, 'PlantId must be a non-empty string');
export type PlantId = z.infer<typeof PlantIdSchema>;

// Confidence schema - number between 0 and 1
export const ConfidenceSchema = z.number()
  .min(0, 'Confidence must be between 0.0 and 1.0')
  .max(1, 'Confidence must be between 0.0 and 1.0')
  .finite('Confidence must be a finite number');
export type Confidence = z.infer<typeof ConfidenceSchema>;

// Coordinates schema - tuple of [lat, lng]
export const CoordinatesSchema = z.tuple([
  z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90').finite(),
  z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180').finite(),
]);
export type Coordinates = z.infer<typeof CoordinatesSchema>;

// Vector schema - array of numbers, can be empty
export const VectorSchema = z.array(z.number().finite());
export type Vector = z.infer<typeof VectorSchema>;

// Raw plant input schema (for validation)
export const RawPlantInputSchema = z.object({
  plantId: z.unknown(),
  disease: z.unknown(),
  confidence: z.unknown(),
  coordinates: z.unknown(),
  vector: z.unknown(),
});
export type RawPlantInput = z.infer<typeof RawPlantInputSchema>;

// Validated Plant schema
export const PlantSchema = z.object({
  plantId: PlantIdSchema,
  disease: DiseaseSchema,
  confidence: ConfidenceSchema,
  coordinates: CoordinatesSchema,
  vector: VectorSchema,
});
export type Plant = z.infer<typeof PlantSchema>;

// Invalid plant record with error
export const InvalidPlantRecordSchema = RawPlantInputSchema.extend({
  error: z.string(),
});
export type InvalidPlantRecord = z.infer<typeof InvalidPlantRecordSchema>;

// Workflow input schema
export const WorkflowInputSchema = z.object({
  plants: z.array(RawPlantInputSchema),
});
export type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

// Plant with description
export const PlantWithDescriptionSchema = PlantSchema.extend({
  description: z.string(),
});
export type PlantWithDescription = z.infer<typeof PlantWithDescriptionSchema>;
