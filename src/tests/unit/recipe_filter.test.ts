import { describe, it, expect } from 'vitest';
import { RecipeService } from '../../infrastructure/services/recipe_service';

describe('Recipe Filter Engine Unit Tests', () => {
  const service = new RecipeService();

  it('filters out recipes containing excluded allergens', async () => {
    const all = await service.getRecipes();
    expect(all.length).toBeGreaterThan(0);

    const withoutGluten = await service.getRecipes({ excludedAllergens: ['GLUTEN'] });
    const brownie = withoutGluten.find(r => r.id === 'rec-06-brownie-avellanas');
    expect(brownie).toBeUndefined();

    // Gazpacho has no allergens, should be present
    const gazpacho = withoutGluten.find(r => r.id === 'rec-02-gazpacho-andaluz');
    expect(gazpacho).toBeDefined();
  });

  it('filters recipes by search query matching ingredient name', async () => {
    const results = await service.getRecipes({ searchQuery: 'aguacate' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec-05-bowl-quinoa-aguacate');
  });

  it('filters recipes by maximum cooking time', async () => {
    const quickRecipes = await service.getRecipes({ maxTotalMinutes: 20 });
    expect(quickRecipes.length).toBeGreaterThan(0);
    quickRecipes.forEach(recipe => {
      expect(recipe.cookingTime.totalMinutes).toBeLessThanOrEqual(20);
    });
  });
});
