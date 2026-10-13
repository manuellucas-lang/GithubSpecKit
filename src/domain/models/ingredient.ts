export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export function validateIngredient(ingredient: Ingredient): void {
  if (!ingredient.id || ingredient.id.trim() === '') {
    throw new Error('Ingredient id is required');
  }
  if (!ingredient.name || ingredient.name.trim() === '') {
    throw new Error('Ingredient name is required');
  }
  if (ingredient.quantity <= 0) {
    throw new Error('Ingredient quantity must be > 0');
  }
  if (!ingredient.unit || ingredient.unit.trim() === '') {
    throw new Error('Ingredient unit is required');
  }
}
