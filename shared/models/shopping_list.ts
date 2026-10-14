/**
 * Represents an aggregated ingredient item on the shopping list.
 */
export interface ShoppingListItem {
  key: string;
  name: string;
  totalQuantity: number;
  unit: string;
  sourceRecipes: string[];
  checked: boolean;
}

/**
 * Builds a deterministic key for aggregating identical ingredients.
 *
 * @param name - The name of the ingredient.
 * @param unit - The unit of measurement.
 * @returns Combined lowercase key.
 */
export function buildIngredientKey(name: string, unit: string): string {
  return `${name.toLowerCase().trim()}_${unit.toLowerCase().trim()}`;
}
