// Standalone execution entry point for testing
// This can be used to run the workflow without Mistral Workflows SDK

import {
  validatePlants,
} from './services/validation.service';
import {
  generateDescriptions,
} from './services/description.service';
import {
  generateAndSaveHeatmap,
} from './services/heatmap.service';
import {
  serializeInvalidPlants,
  toMapData,
} from './services/serialization.service';
import {
  generateGlobalMap,
  saveGlobalMap,
} from './services/map.service';
import {
  ensureOutputDirectories,
  readInput,
  publicUrl,
  WorkflowInput,
} from './utils/fileSystem';

/**
 * Run the workflow standalone
 * This is useful for testing without the Mistral Workflows SDK
 */
async function runWorkflow(): Promise<{ mapUrl: string }> {
  console.log('🚀 Vine AI Workflow Starting...');
  
  // Initialize
  ensureOutputDirectories();
  console.log('✓ Output directories initialized');
  
  // Step 1: Read and validate input
  console.log('\n📥 Reading input...');
  const input = readInput<WorkflowInput>();
  console.log(`  Found ${input.plants?.length || 0} plants in input`);
  
  const validation = validatePlants(input);
  console.log(`  ✓ Valid plants: ${validation.validPlants.length}`);
  console.log(`  ✓ Invalid plants: ${validation.invalidPlants.length}`);
  
  // Step 2: Serialize invalid plants
  serializeInvalidPlants(validation.invalidPlants);
  if (validation.invalidPlants.length > 0) {
    console.log('  ✓ Invalid plants serialized to maps/invalid_plants.json');
  }
  
  // Handle empty input
  if (validation.validPlants.length === 0) {
    console.log('\n⚠ No valid plants found, generating empty map');
    const emptyMapHtml = generateGlobalMap([]);
    saveGlobalMap(emptyMapHtml);
    return { mapUrl: publicUrl('global_map.html') };
  }
  
  // Step 3: Generate descriptions
  console.log('\n💬 Generating descriptions...');
  const plantsWithDesc = await generateDescriptions(validation.validPlants);
  console.log(`  ✓ Descriptions generated for ${plantsWithDesc.length} plants`);
  
  // Step 4: Generate heatmap images
  console.log('\n🖼️ Generating heatmap images...');
  for (const plant of plantsWithDesc) {
    generateAndSaveHeatmap(plant);
  }
  console.log(`  ✓ Heatmap images generated for all plants`);
  
  // Step 5: Generate and save global map
  console.log('\n🗺️ Generating global map...');
  const mapData = toMapData(plantsWithDesc);
  const mapHtml = generateGlobalMap(mapData);
  saveGlobalMap(mapHtml);
  console.log('  ✓ Global map saved to maps/global_map.html');
  
  // Step 6: Return public URL
  const mapUrl = publicUrl('global_map.html');
  console.log(`\n✅ Workflow Complete!`);
  console.log(`📍 Map URL: ${mapUrl}`);
  
  return { mapUrl };
}

// Run if executed directly
if (require.main === module) {
  runWorkflow()
    .then(({ mapUrl }) => {
      console.log(`\n🎉 Success!`);
      console.log(`Open: ${mapUrl}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Workflow Failed:', error);
      process.exit(1);
    });
}

export { runWorkflow };
