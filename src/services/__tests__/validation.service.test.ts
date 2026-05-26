import { validatePlants } from '../validation.service';

describe('Validation Service', () => {
  describe('validatePlants', () => {
    it('should return valid plants', () => {
      const input = {
        plants: [
          {
            plantId: 'vine_001',
            disease: 'Mildew',
            confidence: 0.95,
            coordinates: [43.61, 3.88],
            vector: [0.1, 0.2, 0.3],
          },
          {
            plantId: 'vine_002',
            disease: 'Powdery Mildew',
            confidence: 0.85,
            coordinates: [43.62, 3.89],
            vector: [0.2, 0.3, 0.1],
          },
        ],
      };

      const result = validatePlants(input);
      expect(result.validPlants).toHaveLength(2);
      expect(result.invalidPlants).toHaveLength(0);
    });

    it('should reject invalid coordinates (lat=200)', () => {
      const input = {
        plants: [
          {
            plantId: 'vine_001',
            disease: 'Mildew',
            confidence: 0.95,
            coordinates: [200, 200],
            vector: [0.1, 0.2, 0.3],
          },
        ],
      };

      const result = validatePlants(input);
      expect(result.validPlants).toHaveLength(0);
      expect(result.invalidPlants).toHaveLength(1);
    });

    it('should separate valid and invalid plants', () => {
      const input = {
        plants: [
          {
            plantId: 'vine_001',
            disease: 'Mildew',
            confidence: 0.95,
            coordinates: [43.61, 3.88],
            vector: [0.1, 0.2, 0.3],
          },
          {
            plantId: 'invalid',
            disease: 'Bad',
            confidence: 2,
            coordinates: [200, 200],
            vector: ['bad'],
          },
          {
            plantId: 'vine_002',
            disease: 'Healthy',
            confidence: 0.99,
            coordinates: [43.62, 3.89],
            vector: [0.5],
          },
        ],
      };

      const result = validatePlants(input);
      expect(result.validPlants).toHaveLength(2);
      expect(result.invalidPlants).toHaveLength(1);
      expect(result.invalidPlants[0].plantId).toBe('invalid');
    });

    it('should handle empty plants array', () => {
      const input = { plants: [] };
      const result = validatePlants(input);
      expect(result.validPlants).toHaveLength(0);
      expect(result.invalidPlants).toHaveLength(0);
    });

    it('should handle missing plants', () => {
      const result = validatePlants({});
      expect(result.validPlants).toHaveLength(0);
      expect(result.invalidPlants).toHaveLength(1);
      expect(result.invalidPlants[0].error).toContain('plants');
    });

    it('should handle null input', () => {
      const result = validatePlants(null);
      expect(result.validPlants).toHaveLength(0);
      expect(result.invalidPlants).toHaveLength(1);
    });
  });
});
