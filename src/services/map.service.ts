import * as fs from 'fs';
import * as path from 'path';
import { GLOBAL_MAP_PATH, safeWrite } from '../utils/fileSystem';
import { PlantWithDescription } from '../schemas/plant.schema';
import { PlantMapData } from './serialization.service';

/**
 * Generate the global Leaflet map HTML
 * REQ-005: Generate interactive Leaflet map
 */
export function generateGlobalMap(plants: PlantMapData[]): string {
  if (plants.length === 0) {
    // REQ-005: Handle empty state
    return generateEmptyMap();
  }
  
  return generateLeafletMap(plants);
}

/**
 * Generate HTML for empty state
 */
function generateEmptyMap(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vine AI - No Plants</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</head>
<body>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h1>Vine AI - Phytosanitary Mapping</h1>
    <p style="color: #666;">No valid plants to display.</p>
  </div>
</body>
</html>`;
}

/**
 * Generate full Leaflet map HTML
 * REQ-005: OpenStreetMap base layer, heatmap, popups, legend
 */
function generateLeafletMap(plants: PlantMapData[]): string {
  // Calculate map center
  const center = calculateCenter(plants);
  
  // Generate plant markers
  const markers = plants.map(plant => generateMarker(plant)).join('\n');
  
  // Generate heatmap data
  const heatmapData = generateHeatmapData(plants);
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vine AI - Phytosanitary Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.css" />
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
    .legend {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    .legend h4 { margin: 0 0 10px 0; }
    .legend-item { display: flex; align-items: center; margin: 5px 0; }
    .legend-color { width: 20px; height: 20px; margin-right: 10px; border: 1px solid #ccc; }
    .popup-content { min-width: 300px; }
    .popup-content h3 { margin: 0 0 10px 0; color: #333; }
    .popup-content p { margin: 5px 0; }
    .popup-content img { max-width: 100%; height: auto; margin-top: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="legend">
    <h4>Disease Legend</h4>
    <div class="legend-item">
      <div class="legend-color" style="background: #ff6b6b;"></div>
      <span>Mildew</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #4dabf7;"></div>
      <span>Powdery Mildew</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #51cf66;"></div>
      <span>Healthy</span>
    </div>
  </div>
  
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
  <script>
    const map = L.map('map').setView([${center.lat}, ${center.lng}], 14);
    
    // OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    // Heatmap layer - diseased plants only
    const heatmapData = ${heatmapData};
    if (heatmapData.length > 0) {
      L.heatLayer(heatmapData, { radius: 25, blur: 15 }).addTo(map);
    }
    
    // Marker layer with popups
    ${markers}
    
    // Fit map to markers
    const bounds = ${generateBounds(plants)};
    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }
  </script>
</body>
</html>`;
}

/**
 * Calculate map center from plants
 */
function calculateCenter(plants: PlantMapData[]): { lat: number; lng: number } {
  const lats = plants.map(p => p.coordinates[0]);
  const lngs = plants.map(p => p.coordinates[1]);
  
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
}

/**
 * Generate Leaflet marker code for a plant
 */
function generateMarker(plant: PlantMapData): string {
  const color = getDiseaseColor(plant.disease);
  const confidencePct = Math.round(plant.confidence * 100);
  
  return `L.marker([${plant.coordinates[0]}, ${plant.coordinates[1]}], {
    icon: L.divIcon({
      className: 'plant-marker',
      html: '<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;"></div>',
      iconSize: [20, 20]
    })
  }).bindPopup(
    '<div class="popup-content">' +
    '<h3>Plant ID: ${plant.plantId}</h3>' +
    '<p><b>Diagnosis:</b> ${plant.disease} (${confidencePct}%)</p>' +
    '<p><i>Description:</i> ${escapeHtml(plant.description)}</p>' +
    '<img src="images/${plant.plantId}.png" width="256" height="256" alt="Vector Heatmap" />' +
    '</div>'
  ).addTo(map);`;
}

/**
 * Get color for disease type
 */
function getDiseaseColor(disease: string): string {
  switch (disease) {
    case 'Mildew': return '#ff6b6b';
    case 'Powdery Mildew': return '#4dabf7';
    default: return '#51cf66';
  }
}

/**
 * Generate heatmap data (diseased plants only)
 * REQ-005: Heatmap based on number of diseased plants per area
 */
function generateHeatmapData(plants: PlantMapData[]): string {
  const diseasedPlants = plants.filter(p => p.disease !== 'Healthy');
  const data = diseasedPlants.map(p => 
    `[${p.coordinates[0]}, ${p.coordinates[1]}, 1.0]`
  );
  return `[${data.join(', ')}]`;
}

/**
 * Generate bounds for map fitting
 */
function generateBounds(plants: PlantMapData[]): string {
  const coords = plants.map(p => `[${p.coordinates[0]}, ${p.coordinates[1]}]`);
  return `[${coords.join(', ')}]`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Save global map HTML
 */
export function saveGlobalMap(html: string): void {
  safeWrite(GLOBAL_MAP_PATH, html);
}
