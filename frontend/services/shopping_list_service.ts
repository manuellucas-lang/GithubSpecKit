import { WeeklyPlan } from '@shared/models/weekly_plan';
import { ShoppingListItem, buildIngredientKey } from '@shared/models/shopping_list';

export class ShoppingListService {
  generateShoppingList(plan: WeeklyPlan, existingCheckedKeys: string[] = []): ShoppingListItem[] {
    const checkedSet = new Set(existingCheckedKeys);
    const aggregationMap = new Map<string, {
      name: string;
      totalQuantity: number;
      unit: string;
      sourceRecipesSet: Set<string>;
    }>();

    // Iterate through each day and slot
    Object.values(plan).forEach(day => {
      const meals = [day.lunch, day.dinner].filter(Boolean);

      meals.forEach(recipe => {
        if (!recipe) return;

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

    // Convert map to sorted array
    const result: ShoppingListItem[] = [];
    aggregationMap.forEach((entry, key) => {
      result.push({
        key,
        name: entry.name,
        totalQuantity: Math.round(entry.totalQuantity * 100) / 100, // Round to 2 decimals
        unit: entry.unit,
        sourceRecipes: Array.from(entry.sourceRecipesSet),
        checked: checkedSet.has(key),
      });
    });

    // Sort alphabetically by ingredient name
    return result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  formatAsPlainText(items: ShoppingListItem[]): string {
    if (items.length === 0) {
      return 'Lista de la compra vacia (no hay recetas programadas).';
    }

    const lines: string[] = [
      'LISTA DE LA COMPRA - GOURMETCRAFT',
      '==================================',
      '',
    ];

    items.forEach(item => {
      const statusMark = item.checked ? '[x]' : '[ ]';
      const sources = item.sourceRecipes.join(', ');
      lines.push(`${statusMark} ${item.name}: ${item.totalQuantity} ${item.unit} (Para: ${sources})`);
    });

    lines.push('');
    lines.push(`Total de ingredientes: ${items.length}`);
    return lines.join('\n');
  }
}

export const shoppingListService = new ShoppingListService();
