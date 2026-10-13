export interface ShoppingListItem {
  key: string;
  name: string;
  totalQuantity: number;
  unit: string;
  sourceRecipes: string[];
  checked: boolean;
}

export function buildIngredientKey(name: string, unit: string): string {
  return `${name.toLowerCase().trim()}_${unit.toLowerCase().trim()}`;
}
