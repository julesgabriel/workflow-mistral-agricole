import { workflow, activities } from '@mistralai/workflows-sdk';
import * as fs from 'fs';
import {
  validatePlants,
  ValidationResult,
} from '../services/validation.service';
import {
  generateDescriptions,
} from '../services/description.service';
import {
  generateAndSaveHeatmap,
} from '../services/heatmap.service';
import {
  serializeInvalidPlants,
  toMapData,
} from '../services/serialization.service';
import {
  generateGlobalMap,
  saveGlobalMap,
} from '../services/map.service';
import {
  ensureOutputDirectories,
  readInput,
  publicUrl,
  WorkflowInput,
} from '../utils/fileSystem';

/**
 * Vine AI Phytosanitary Mapping Workflow
 * VINEAI-001
 * 
 * Atomic steps:
 * 1. Validate input and separate valid/invalid plants
 * 2. Generate text descriptions using Mistral Small
 * 3. Generate heatmap images from vectors
 * 4. Create interactive Leaflet map
 * 5. Return public URL
 */
@workflow.define()
class VineAiWorkflow {
  @workflow.entrypoint()
  async run(): Promise<{ mapUrl: string }> {
    // Initialize file system
    ensureOutputDirectories();
    
    // Step 1: Read and validate input
    const input = readInput<WorkflowInput>();
    const validation = validatePlants(input);
    
    // Step 2: Serialize invalid plants
    serializeInvalidPlants(validation.invalidPlants);
    
    // Check if we have valid plants
    if (validation.validPlants.length === 0) {
      // Generate empty map
      const emptyMapHtml = generateGlobalMap([]);
      saveGlobalMap(emptyMapHtml);
      return { mapUrl: publicUrl('global_map.html') };
    }
    
    // Step 3: Generate descriptions for valid plants
    const plantsWithDesc = await generateDescriptions(validation.validPlants);
    
    // Step 4: Generate heatmap images for each plant
    for (const plant of plantsWithDesc) {
      generateAndSaveHeatmap(plant);
    }
    
    // Step 5: Generate and save the global map
    const mapData = toMapData(plantsWithDesc);
    const mapHtml = generateGlobalMap(mapData);
    saveGlobalMap(mapHtml);
    
    // Step 6: Return public URL
    return { mapUrl: publicUrl('global_map.html') };
  }
}

export { VineAiWorkflow };
