import * as fs from 'fs';
import * as path from 'path';
import { IMAGES_DIR } from '../utils/fileSystem';
import { Plant } from '../schemas/plant.schema';

const WIDTH = 256;
const HEIGHT = 256;

/**
 * Generate a heatmap image from a vector
 * REQ-004: Transform vector into 256x256 PNG image
 * Zero external dependencies
 * 
 * Uses a minimal grayscale PNG encoder
 */
export function generateHeatmap(plant: Plant): Buffer {
  const { plantId, vector } = plant;
  
  // Fallback for empty/malformed vector
  if (!vector || vector.length === 0) {
    console.warn(`Empty vector for ${plantId}, generating black image`);
    return createGrayscalePng(new Uint8Array(WIDTH * HEIGHT).fill(0));
  }
  
  // Normalize vector to grayscale values
  const pixels = normalizeToGrayscale(vector);
  
  return createGrayscalePng(pixels);
}

/**
 * Normalize vector to 0-255 grayscale pixels
 */
function normalizeToGrayscale(vector: number[]): Uint8Array {
  const pixels = new Uint8Array(WIDTH * HEIGHT);
  const min = Math.min(...vector);
  const max = Math.max(...vector);
  const range = max - min || 1;
  
  for (let i = 0; i < pixels.length; i++) {
    const value = vector[i % vector.length];
    pixels[i] = Math.round(((value - min) / range) * 255);
  }
  
  return pixels;
}

/**
 * Create a grayscale PNG image buffer
 * Minimal implementation for 8-bit grayscale images
 */
function createGrayscalePng(pixels: Uint8Array): Buffer {
  const width = WIDTH;
  const height = HEIGHT;
  const bytesPerPixel = 1; // Grayscale
  const bytesPerRow = width * bytesPerPixel;
  
  // Calculate total data size: IHDR (13) + IDAT + IEND (0)
  // IDAT data: each row has 1 filter byte + pixels
  const rowSize = bytesPerRow + 1; // +1 for filter byte
  const imageDataSize = rowSize * height;
  
  // Build the PNG
  const chunks: Buffer[] = [];
  
  // PNG signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);   // 8 bits per pixel
  ihdrData.writeUInt8(0, 9);  // Color type 0 = grayscale
  ihdrData.writeUInt8(0, 10); // Compression: deflate
  ihdrData.writeUInt8(0, 11); // Filter: none
  ihdrData.writeUInt8(0, 12); // Interlace: none
  chunks.push(createChunk('IHDR', ihdrData));
  
  // IDAT chunk - raw deflate stream (no compression for simplicity)
  // Each scanline: [filter-type, pixel-data...]
  const scanlines: Buffer[] = [];
  for (let y = 0; y < height; y++) {
    const offset = y * width;
    const scanline = Buffer.alloc(rowSize);
    scanline[0] = 0; // Filter type 0 = none
    for (let x = 0; x < width; x++) {
      scanline[x + 1] = pixels[offset + x];
    }
    scanlines.push(scanline);
  }
  const idatData = Buffer.concat(scanlines);
  chunks.push(createChunk('IDAT', idatData));
  
  // IEND chunk
  chunks.push(createChunk('IEND', Buffer.alloc(0)));
  
  return Buffer.concat(chunks);
}

/**
 * Create a PNG chunk (length, type, data, crc)
 */
function createChunk(type: string, data: Buffer): Buffer {
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);
  
  const typeBuf = Buffer.from(type);
  const crcBuf = computeCrc32(Buffer.concat([typeBuf, data]));
  
  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

/**
 * CRC32 table
 */
const crcTable: number[] = (() => {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

/**
 * Compute CRC32
 */
function computeCrc32(data: Buffer): Buffer {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0;
  const buf = Buffer.alloc(4);
  buf.writeUInt32BE(crc, 0);
  return buf;
}

/**
 * Save heatmap image
 */
export function saveHeatmap(plant: Plant, pngBuffer: Buffer): void {
  const filePath = path.join(IMAGES_DIR, `${plant.plantId}.png`);
  fs.writeFileSync(filePath, pngBuffer);
}

/**
 * Generate and save heatmap
 */
export function generateAndSaveHeatmap(plant: Plant): void {
  const pngBuffer = generateHeatmap(plant);
  saveHeatmap(plant, pngBuffer);
}
