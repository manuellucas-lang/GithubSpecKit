import { describe, it, expect } from 'vitest';
import { RecipeService } from '../../infrastructure/services/recipe_service';

describe('RecipeService Contract Tests', () => {
  const service = new RecipeService();

  it('should return all recipes when no filters provided', async () => {
    const recipes = await service.getRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(6);
  });

  it('should return a specific recipe by valid id with ingredients, cookingTime, steps and allergens', async () => {
    const recipe = await service.getRecipeById('rec-01-paella-marisco');
    expect(recipe).not.toBeNull();
    expect(recipe?.title).toContain('Paella');
    expect(recipe?.ingredients.length).toBeGreaterThan(0);
    expect(recipe?.steps.length).toBeGreaterThan(0);
    expect(recipe?.cookingTime.prepMinutes).toBe(20);
    expect(recipe?.cookingTime.cookMinutes).toBe(25);
    expect(recipe?.cookingTime.totalMinutes).toBe(45);
    expect(recipe?.allergens).toContain('CRUSTACEANS');
  });

  it('should return null when recipe id is not found', async () => {
    const recipe = await service.getRecipeById('non-existent-id');
    expect(recipe).toBeNull();
  });

  it('should return the complete catalog of 14 allergens', () => {
    const allergens = service.getAllergensCatalog();
    expect(allergens).toHaveLength(14);
    expect(allergens).toContain('GLUTEN');
    expect(allergens).toContain('DAIRY');
  });
});
