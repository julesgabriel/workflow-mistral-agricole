import { z } from 'zod';
import {
  RawPlantInputSchema,
  PlantSchema,
  InvalidPlantRecordSchema,
  WorkflowInputSchema,
  Plant,
  InvalidPlantRecord,
  WorkflowInput,
} from '../schemas/plant.schema';

/**
 * Validation result
 */
export interface ValidationResult {
  validPlants: Plant[];
  invalidPlants: InvalidPlantRecord[];
}

/**
 * Parse a single plant with error handling
 */
function parsePlant(rawPlant: z.infer<typeof RawPlantInputSchema>): Plant | InvalidPlantRecord {
  const result = PlantSchema.safeParse({
    plantId: rawPlant.plantId,
    disease: rawPlant.disease,
    confidence: rawPlant.confidence,
    coordinates: rawPlant.coordinates,
    vector: rawPlant.vector,
  });

  if (result.success) {
    return result.data;
  }

  // Validation failed - return invalid record
  // Extract error messages from ZodError
  const errorMessages = result.error.issues
    .map(issue => issue.message)
    .join('; ');
  
  return {
    ...rawPlant,
    error: errorMessages,
  };
}

/**
 * Validate all plants in workflow input
 * REQ-002: Validate input data schema before processing
 */
export function validatePlants(input: unknown): ValidationResult {
  const parsedInput = WorkflowInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      validPlants: [],
      invalidPlants: [
        {
          plantId: null,
          disease: null,
          confidence: null,
          coordinates: null,
          vector: null,
          error: 'Input must contain a "plants" array',
        },
      ],
    };
  }

  const validPlants: Plant[] = [];
  const invalidPlants: InvalidPlantRecord[] = [];

  for (const rawPlant of parsedInput.data.plants) {
    const result = parsePlant(rawPlant);
    if ('error' in result) {
      invalidPlants.push(InvalidPlantRecordSchema.parse(result));
    } else {
      validPlants.push(result);
    }
  }

  return { validPlants, invalidPlants };
}
