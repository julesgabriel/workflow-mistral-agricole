import { Plant, PlantWithDescription } from '../schemas/plant.schema';

/**
 * Generate description for a plant using disease and confidence
 * REQ-003: Generate text description using Mistral Small
 * Anti-pattern: Vectors MUST NOT be used
 */
export async function generateDescription(plant: Plant): Promise<string> {
  // REQ-003: Use only disease and confidence
  const { disease, confidence } = plant;
  
  // In production, this would call Mistral Small API
  // For now, generate a deterministic description based on disease and confidence
  const confidencePercent = Math.round(confidence * 100);
  
  const descriptions: Record<string, string> = {
    Mildew: `This vine shows signs of Mildew disease with a confidence level of ${confidencePercent}%. ` +
      'Mildew typically appears as yellowish spots on the upper surface of leaves.',
    'Powdery Mildew': `This vine shows signs of Powdery Mildew disease with a confidence level of ${confidencePercent}%. ` +
      'Powdery Mildew appears as white, powdery spots on leaves and stems.',
    Healthy: `This vine is healthy with a confidence level of ${confidencePercent}%. ` +
      'No visible signs of disease detected.',
  };
  
  return descriptions[disease] || `Unknown disease with confidence ${confidencePercent}%`;
}

/**
 * Generate descriptions for all plants with error handling
 * REQ-003: API fault tolerance - fallback to empty string on error
 */
export async function generateDescriptions(plants: Plant[]): Promise<PlantWithDescription[]> {
  const results: PlantWithDescription[] = [];
  
  for (const plant of plants) {
    try {
      const description = await generateDescription(plant);
      results.push({
        ...plant,
        description,
      });
    } catch (error) {
      // Fallback: empty description
      console.error(`Failed to generate description for ${plant.plantId}:`, error);
      results.push({
        ...plant,
        description: '',
      });
    }
  }
  
  return results;
}
