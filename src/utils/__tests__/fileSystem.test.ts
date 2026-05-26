import * as fs from 'fs';
import * as path from 'path';
import {
  OUTPUT_DIR,
  IMAGES_DIR,
  GLOBAL_MAP_PATH,
  INVALID_PLANTS_PATH,
  INPUT_FILE_PATH,
  ensureOutputDirectories,
  guardProtected,
  guardMapsDir,
  safeWrite,
  publicUrl,
} from '../fileSystem';

describe('File System Utils', () => {
  beforeAll(() => {
    ensureOutputDirectories();
  });

  describe('ensureOutputDirectories', () => {
    it('should have created OUTPUT_DIR', () => {
      expect(fs.existsSync(OUTPUT_DIR)).toBe(true);
    });

    it('should have created IMAGES_DIR', () => {
      expect(fs.existsSync(IMAGES_DIR)).toBe(true);
    });
  });

  describe('guardProtected', () => {
    it('should throw for INPUT_FILE_PATH', () => {
      expect(() => guardProtected(INPUT_FILE_PATH)).toThrow();
    });

    it('should not throw for OUTPUT_DIR', () => {
      expect(() => guardProtected(OUTPUT_DIR)).not.toThrow();
    });
  });

  describe('guardMapsDir', () => {
    it('should not throw for maps directory', () => {
      expect(() => guardMapsDir(OUTPUT_DIR)).not.toThrow();
    });

    it('should not throw for images directory', () => {
      expect(() => guardMapsDir(IMAGES_DIR)).not.toThrow();
    });

    it('should throw for outside maps', () => {
      expect(() => guardMapsDir('/tmp/test.txt')).toThrow();
    });
  });

  describe('safeWrite', () => {
    it('should write to maps directory', () => {
      const testPath = path.join(OUTPUT_DIR, 'test-write.txt');
      safeWrite(testPath, 'test');
      expect(fs.existsSync(testPath)).toBe(true);
      fs.unlinkSync(testPath);
    });

    it('should throw for protected path', () => {
      expect(() => safeWrite(INPUT_FILE_PATH, 'test')).toThrow();
    });

    it('should throw for outside maps', () => {
      expect(() => safeWrite('/tmp/test.txt', 'test')).toThrow();
    });
  });

  describe('publicUrl', () => {
    it('should generate GitHub URL', () => {
      const url = publicUrl('global_map.html');
      expect(url).toContain('github.com');
      expect(url).toContain('/maps/global_map.html');
    });

    it('should handle path traversal', () => {
      const url = publicUrl('../../etc/passwd');
      expect(url).not.toContain('etc/passwd');
      expect(url).toContain('/maps/');
    });
  });
});
