import * as fs from 'fs';
import * as path from 'path';

// Paths
export const PROJECT_ROOT = path.join(__dirname, '..', '..');
export const OUTPUT_DIR = path.join(PROJECT_ROOT, 'maps');
export const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');
export const GLOBAL_MAP_PATH = path.join(OUTPUT_DIR, 'global_map.html');
export const INVALID_PLANTS_PATH = path.join(OUTPUT_DIR, 'invalid_plants.json');
export const INPUT_FILE_PATH = path.join(PROJECT_ROOT, 'input.json');

// Protected paths (read-only)
const PROTECTED_PATHS = [path.resolve(INPUT_FILE_PATH)];

/**
 * Ensure output directories exist
 */
export function ensureOutputDirectories(): void {
  [OUTPUT_DIR, IMAGES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Check if path is protected
 */
function isProtected(filePath: string): boolean {
  return PROTECTED_PATHS.includes(path.resolve(filePath));
}

/**
 * Guard against writing to protected paths
 */
export function guardProtected(filePath: string): void {
  if (isProtected(filePath)) {
    throw new Error(`ANTI-PATTERN: Cannot write to protected path: ${filePath}`);
  }
}

/**
 * Guard against writing outside maps directory
 */
export function guardMapsDir(filePath: string): void {
  const absPath = path.normalize(path.resolve(filePath));
  const mapsDir = path.normalize(path.resolve(OUTPUT_DIR));
  
  if (!absPath.startsWith(mapsDir + path.sep) && absPath !== mapsDir) {
    throw new Error(`ANTI-PATTERN: Cannot write outside maps/: ${filePath}`);
  }
}

/**
 * Safe write ensuring path is valid
 */
export function safeWrite(filePath: string, data: string | Buffer): void {
  const absPath = path.resolve(filePath);
  guardProtected(absPath);
  guardMapsDir(absPath);
  
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(absPath, data);
}

/**
 * Read input file
 */
export function readInput<T>(): T {
  if (!fs.existsSync(INPUT_FILE_PATH)) {
    throw new Error(`Input file not found: ${INPUT_FILE_PATH}`);
  }
  return JSON.parse(fs.readFileSync(INPUT_FILE_PATH, 'utf-8')) as T;
}

/**
 * Generate public GitHub URL
 */
export function publicUrl(fileName: string): string {
  const owner = process.env.GITHUB_OWNER || 'julesgabriel';
  const repo = process.env.GITHUB_REPO || 'workflow-mistral-agricole';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const cleanName = path.basename(fileName);
  return `https://github.com/${owner}/${repo}/blob/${branch}/maps/${cleanName}`;
}
