import { Recipe, RecipeDifficulty } from '@shared/models/recipe';
import { AllergenCode } from '@shared/models/allergen';
import { apiClient } from '../api/api_client';
import seedData from '@shared/data/recipes.seed.json';

export interface RecipeFilterOptions {
  searchQuery?: string;
  excludedAllergens?: AllergenCode[];
  maxTotalMinutes?: number;
  difficulty?: RecipeDifficulty;
}

export class RecipeService {
  private localFallbackRecipes: Recipe[];

  constructor(initialRecipes: Recipe[] = seedData as unknown as Recipe[]) {
    this.localFallbackRecipes = [...initialRecipes];
  }

  async getRecipes(filters?: RecipeFilterOptions): Promise<Recipe[]> {
    try {
      const response = await apiClient.getRecipes({
        search: filters?.searchQuery,
        maxCookingMinutes: filters?.maxTotalMinutes,
        difficulty: filters?.difficulty,
      });

      let recipes = (response.data as unknown as Recipe[]) || [];

      // Filter excluded allergens client-side if returned list needs allergen exclusion
      if (filters?.excludedAllergens && filters.excludedAllergens.length > 0) {
        const excludedSet = new Set(filters.excludedAllergens);
        recipes = recipes.filter(recipe => {
          return !recipe.allergens.some(allergen => excludedSet.has(allergen as AllergenCode));
        });
      }

      return recipes;
    } catch {
      // Graceful fallback to embedded recipes if offline or during server bootstrap
      return this.filterLocally(filters);
    }
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const recipe = await apiClient.getRecipeById(id);
      return (recipe as unknown as Recipe) || null;
    } catch {
      const found = this.localFallbackRecipes.find(r => r.id === id);
      return found ? { ...found } : null;
    }
  }

  private filterLocally(filters?: RecipeFilterOptions): Recipe[] {
    let result = [...this.localFallbackRecipes];
    if (!filters) return result;

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(recipe => {
        const matchesTitle = recipe.title.toLowerCase().includes(q);
        const matchesDesc = recipe.description.toLowerCase().includes(q);
        const matchesIngredient = recipe.ingredients.some(ing =>
          ing.name.toLowerCase().includes(q)
        );
        return matchesTitle || matchesDesc || matchesIngredient;
      });
    }

    if (filters.excludedAllergens && filters.excludedAllergens.length > 0) {
      const excludedSet = new Set(filters.excludedAllergens);
      result = result.filter(recipe => {
        return !recipe.allergens.some(allergen => excludedSet.has(allergen as AllergenCode));
      });
    }

    if (typeof filters.maxTotalMinutes === 'number' && filters.maxTotalMinutes > 0) {
      result = result.filter(recipe => recipe.cookingTime.totalMinutes <= filters.maxTotalMinutes!);
    }

    if (filters.difficulty) {
      result = result.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    return result;
  }

  getAllergensCatalog(): AllergenCode[] {
    return [
      'GLUTEN',
      'CRUSTACEANS',
      'EGGS',
      'FISH',
      'PEANUTS',
      'SOY',
      'DAIRY',
      'NUTS',
      'CELERY',
      'MUSTARD',
      'SESAME',
      'SULPHITES',
      'LUPIN',
      'MOLLUSCS',
    ];
  }
}

export const recipeService = new RecipeService();
