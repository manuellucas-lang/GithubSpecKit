/**
 * Represents a user's stored image preference for a specific recipe.
 */
export interface RecipeImagePreference {
  recipeId: string;
  imageId: string;
  url: string;
  thumbUrl: string;
  altDescription: string;
  photographerName: string;
  photographerUrl?: string;
  isCustom: boolean;
  updatedAt: string;
}

/**
 * Validates a recipe image preference record against format and integrity rules.
 *
 * @param preference - The recipe image preference to validate.
 * @throws {Error} If recipe id, image id, url is empty, or if updatedAt is not a valid ISO timestamp.
 */
export function validateRecipeImagePreference(preference: RecipeImagePreference): void {
  if (!preference.recipeId || preference.recipeId.trim() === '') {
    throw new Error('Recipe id is required for image preference');
  }
  if (!preference.imageId || preference.imageId.trim() === '') {
    throw new Error('Image id is required for image preference');
  }
  if (!preference.url || preference.url.trim() === '') {
    throw new Error('Image URL is required for image preference');
  }
  if (!preference.updatedAt || isNaN(Date.parse(preference.updatedAt))) {
    throw new Error('Valid ISO-8601 updatedAt timestamp is required');
  }
}

