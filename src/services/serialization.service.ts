import { safeWrite, INVALID_PLANTS_PATH } from '../utils/fileSystem';
import { InvalidPlantRecord, PlantWithDescription } from '../schemas/plant.schema';

/**
 * Serialize invalid plants to JSON file
 * REQ-002: Invalid plants listed in invalid_plants.json
 */
export function serializeInvalidPlants(invalidPlants: InvalidPlantRecord[]): void {
  if (invalidPlants.length === 0) {
    return; // Don't create file if no invalid plants
  }

  const data = JSON.stringify(invalidPlants, null, 2);
  safeWrite(INVALID_PLANTS_PATH, data);
}

/**
 * Plant data for map generation
 */
export interface PlantMapData {
  plantId: string;
  disease: string;
  confidence: number;
  coordinates: [number, number];
  description: string;
}

/**
 * Serialize plants for map
 */
export function toMapData(plants: PlantWithDescription[]): PlantMapData[] {
  return plants.map(p => ({
    plantId: p.plantId,
    disease: p.disease,
    confidence: p.confidence,
    coordinates: p.coordinates,
    description: p.description,
  }));
}
