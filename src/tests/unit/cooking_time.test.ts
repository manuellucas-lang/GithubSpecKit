import { describe, it, expect } from 'vitest';
import { createCookingTime } from '../../domain/models/cooking_time';
import { validateIngredient } from '../../domain/models/ingredient';

describe('CookingTime & Ingredient Unit Tests', () => {
  it('should calculate total minutes accurately and format minutes under 1 hour', () => {
    const time = createCookingTime(15, 20);
    expect(time.totalMinutes).toBe(35);
    expect(time.displayLabel).toBe('35 min');
  });

  it('should format hours and minutes correctly when total exceeds 60 minutes', () => {
    const time = createCookingTime(30, 45);
    expect(time.totalMinutes).toBe(75);
    expect(time.displayLabel).toBe('1 h 15 min');
  });

  it('should format properly when cookMinutes is 0 (cold dish)', () => {
    const time = createCookingTime(15, 0);
    expect(time.totalMinutes).toBe(15);
    expect(time.displayLabel).toBe('15 min (Sin cocción térmica)');
  });

  it('should throw an error if prepMinutes or cookMinutes is negative', () => {
    expect(() => createCookingTime(-5, 10)).toThrow('prepMinutes must be >= 0');
    expect(() => createCookingTime(10, -5)).toThrow('cookMinutes must be >= 0');
  });

  it('should validate ingredients correctly', () => {
    expect(() =>
      validateIngredient({ id: '1', name: 'Arroz', quantity: 200, unit: 'g' })
    ).not.toThrow();

    expect(() =>
      validateIngredient({ id: '2', name: 'Arroz', quantity: -10, unit: 'g' })
    ).toThrow('Ingredient quantity must be > 0');
  });
});
