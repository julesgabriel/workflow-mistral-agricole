import {
  DiseaseSchema,
  PlantIdSchema,
  ConfidenceSchema,
  CoordinatesSchema,
  VectorSchema,
  PlantSchema,
  WorkflowInputSchema,
} from '../plant.schema';

describe('Plant Schema', () => {
  describe('DiseaseSchema', () => {
    it.each(['Mildew', 'Powdery Mildew', 'Healthy'])('should accept %s', (disease) => {
      expect(() => DiseaseSchema.parse(disease)).not.toThrow();
    });

    it('should reject invalid disease', () => {
      expect(() => DiseaseSchema.parse('Unknown')).toThrow();
    });
  });

  describe('PlantIdSchema', () => {
    it('should accept valid plantId', () => {
      expect(PlantIdSchema.parse('vine_001')).toBe('vine_001');
    });

    it('should reject empty string', () => {
      expect(() => PlantIdSchema.parse('')).toThrow();
    });
  });

  describe('ConfidenceSchema', () => {
    it.each([0, 0.5, 1])('should accept %s', (value) => {
      expect(ConfidenceSchema.parse(value)).toBe(value);
    });

    it.each([-0.1, 1.1, NaN, Infinity])('should reject %s', (value) => {
      expect(() => ConfidenceSchema.parse(value)).toThrow();
    });
  });

  describe('CoordinatesSchema', () => {
    it('should accept valid coordinates', () => {
      expect(CoordinatesSchema.parse([43.61, 3.88])).toEqual([43.61, 3.88]);
    });

    it.each([
      [200, 0], // Invalid lat
      [0, 200], // Invalid lng
      [-91, 0], // Lat too low
      [0, -181], // Lng too low
    ])('should reject [%s, %s]', (lat, lng) => {
      expect(() => CoordinatesSchema.parse([lat, lng])).toThrow();
    });
  });

  describe('VectorSchema', () => {
    it('should accept valid vector', () => {
      expect(VectorSchema.parse([0.1, 0.2, 0.3])).toEqual([0.1, 0.2, 0.3]);
    });

    it('should accept empty vector', () => {
      expect(VectorSchema.parse([])).toEqual([]);
    });

    it('should reject non-numeric', () => {
      expect(() => VectorSchema.parse([0.1, 'x', 0.3] as any)).toThrow();
    });
  });

  describe('PlantSchema', () => {
    it('should accept valid plant', () => {
      const plant = {
        plantId: 'vine_001',
        disease: 'Mildew' as const,
        confidence: 0.95,
        coordinates: [43.61, 3.88] as const,
        vector: [0.1, 0.2, 0.3],
      };
      expect(() => PlantSchema.parse(plant)).not.toThrow();
    });

    it('should reject invalid plant', () => {
      const plant = {
        plantId: '',
        disease: 'Mildew' as const,
        confidence: 0.95,
        coordinates: [43.61, 3.88] as const,
        vector: [0.1, 0.2, 0.3],
      };
      expect(() => PlantSchema.parse(plant)).toThrow();
    });
  });

  describe('WorkflowInputSchema', () => {
    it('should accept valid input', () => {
      const input = {
        plants: [
          {
            plantId: 'vine_001',
            disease: 'Mildew',
            confidence: 0.95,
            coordinates: [43.61, 3.88],
            vector: [0.1, 0.2, 0.3],
          },
        ],
      };
      expect(() => WorkflowInputSchema.parse(input)).not.toThrow();
    });

    it('should reject missing plants', () => {
      expect(() => WorkflowInputSchema.parse({})).toThrow();
    });
  });
});
