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

/**
 * Aggregates ingredients from a weekly plan into a consolidated, rounded, and sorted shopping list.
 *
 * @param plan - The weekly meal plan.
 * @param existingCheckedKeys - Optional keys of already checked items.
 * @returns Sorted shopping list items with quantities rounded to 2 decimal places.
 */
export function generateShoppingListFromPlan(plan: Record<string, { lunch: { title: string; ingredients?: Array<{ name: string; quantity: number; unit: string }> } | null; dinner: { title: string; ingredients?: Array<{ name: string; quantity: number; unit: string }> } | null }>, existingCheckedKeys: string[] = []): ShoppingListItem[] {
  const checkedSet = new Set(existingCheckedKeys);
  const aggregationMap = new Map<string, {
    name: string;
    totalQuantity: number;
    unit: string;
    sourceRecipesSet: Set<string>;
  }>();

  Object.values(plan).forEach(day => {
    if (!day) return;
    const meals = [day.lunch, day.dinner].filter(Boolean);

    meals.forEach(recipe => {
      if (!recipe || !Array.isArray(recipe.ingredients)) return;

      recipe.ingredients.forEach(ingredient => {
        const key = buildIngredientKey(ingredient.name, ingredient.unit);

        if (!aggregationMap.has(key)) {
          aggregationMap.set(key, {
            name: ingredient.name,
            totalQuantity: ingredient.quantity,
            unit: ingredient.unit,
            sourceRecipesSet: new Set([recipe.title]),
          });
        } else {
          const entry = aggregationMap.get(key)!;
          entry.totalQuantity += ingredient.quantity;
          entry.sourceRecipesSet.add(recipe.title);
        }
      });
    });
  });

  const result: ShoppingListItem[] = [];
  aggregationMap.forEach((entry, key) => {
    result.push({
      key,
      name: entry.name,
      totalQuantity: Math.round(entry.totalQuantity * 100) / 100,
      unit: entry.unit,
      sourceRecipes: Array.from(entry.sourceRecipesSet),
      checked: checkedSet.has(key),
    });
  });

  return result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
