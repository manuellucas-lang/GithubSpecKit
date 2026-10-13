import { AllergenCode } from './allergen.types';
import { CookingTime } from './cooking_time';
import { Ingredient } from './ingredient';

export type RecipeDifficulty = 'Fácil' | 'Intermedio' | 'Avanzado';

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  estimatedMinutes?: number;
}

export interface RecipeImage {
  keyword: string;
  imageUrl?: string;
  thumbUrl?: string;
  photographerName?: string;
  sourceUrl?: string;
  fetchStatus: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'FALLBACK';
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  keyword: string;
  servings: number;
  difficulty: RecipeDifficulty;
  cookingTime: CookingTime;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  allergens: AllergenCode[];
  image?: RecipeImage;
}

export function validateRecipe(recipe: Recipe): void {
  if (!recipe.id || recipe.id.trim() === '') {
    throw new Error('Recipe id is required');
  }
  if (!recipe.title || recipe.title.trim().length < 3 || recipe.title.trim().length > 100) {
    throw new Error('Recipe title must be between 3 and 100 characters');
  }
  if (!recipe.keyword || recipe.keyword.trim() === '') {
    throw new Error('Recipe keyword is required for image search');
  }
  if (recipe.servings < 1) {
    throw new Error('Recipe servings must be >= 1');
  }
  if (!['Fácil', 'Intermedio', 'Avanzado'].includes(recipe.difficulty)) {
    throw new Error('Recipe difficulty must be Fácil, Intermedio, or Avanzado');
  }
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    throw new Error('Recipe must contain at least one ingredient');
  }
  if (!recipe.steps || recipe.steps.length === 0) {
    throw new Error('Recipe must contain at least one preparation step');
  }
}
