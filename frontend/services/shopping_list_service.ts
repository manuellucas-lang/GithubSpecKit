import { WeeklyPlan } from '@shared/models/weekly_plan';
import { ShoppingListItem, generateShoppingListFromPlan } from '@shared/models/shopping_list';

export class ShoppingListService {
  generateShoppingList(plan: WeeklyPlan, existingCheckedKeys: string[] = []): ShoppingListItem[] {
    return generateShoppingListFromPlan(plan, existingCheckedKeys);
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
