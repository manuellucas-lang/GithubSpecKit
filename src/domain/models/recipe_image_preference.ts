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
