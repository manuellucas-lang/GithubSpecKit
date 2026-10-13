import { Recipe, RecipeDifficulty } from '../../domain/models/recipe';
import { AllergenCode } from '../../domain/models/allergen.types';
import seedData from '../data/recipes.seed.json';

export interface RecipeFilterOptions {
  searchQuery?: string;
  excludedAllergens?: AllergenCode[];
  maxTotalMinutes?: number;
  difficulty?: RecipeDifficulty;
}

export class RecipeService {
  private recipes: Recipe[];

  constructor(initialRecipes: Recipe[] = seedData as unknown as Recipe[]) {
    this.recipes = [...initialRecipes];
  }

  async getRecipes(filters?: RecipeFilterOptions): Promise<Recipe[]> {
    let result = [...this.recipes];

    if (!filters) {
      return result;
    }

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
        return !recipe.allergens.some(allergen => excludedSet.has(allergen));
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

  async getRecipeById(id: string): Promise<Recipe | null> {
    const found = this.recipes.find(r => r.id === id);
    return found ? { ...found } : null;
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
