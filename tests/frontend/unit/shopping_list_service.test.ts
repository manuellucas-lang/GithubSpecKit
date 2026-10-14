import { describe, it, expect } from 'vitest';
import { ShoppingListService } from '@frontend/services/shopping_list_service';
import { createEmptyWeeklyPlan } from '@shared/models/weekly_plan';
import { Recipe } from '@shared/models/recipe';

const recipeA: Recipe = {
  id: 'rec-a',
  title: 'Paella',
  description: 'Arroz rico',
  keyword: 'paella',
  servings: 4,
  difficulty: 'Intermedio',
  cookingTime: { prepMinutes: 10, cookMinutes: 20, totalMinutes: 30, displayLabel: '30 min' },
  ingredients: [
    { id: '1', name: 'Arroz bomba', quantity: 400, unit: 'g' },
    { id: '2', name: 'Aceite de oliva', quantity: 50, unit: 'ml' },
  ],
  steps: [{ stepNumber: 1, title: 'Cocinar', instruction: 'Hacer arroz' }],
  allergens: [],
};

const recipeB: Recipe = {
  id: 'rec-b',
  title: 'Risotto',
  description: 'Arroz cremoso',
  keyword: 'risotto',
  servings: 2,
  difficulty: 'Fácil',
  cookingTime: { prepMinutes: 10, cookMinutes: 15, totalMinutes: 25, displayLabel: '25 min' },
  ingredients: [
    { id: '3', name: 'Arroz bomba', quantity: 200, unit: 'g' },
    { id: '4', name: 'Mantequilla', quantity: 30, unit: 'g' },
  ],
  steps: [{ stepNumber: 1, title: 'Cocinar', instruction: 'Mantecar' }],
  allergens: [],
};

describe('ShoppingListService Unit Tests', () => {
  const service = new ShoppingListService();

  it('generates an empty shopping list when plan has no assigned meals', () => {
    const plan = createEmptyWeeklyPlan();
    const items = service.generateShoppingList(plan);
    expect(items).toHaveLength(0);
  });

  it('consolidates identical ingredients with matching units by summing quantities', () => {
    const plan = createEmptyWeeklyPlan();
    plan.lunes.lunch = recipeA;
    plan.martes.dinner = recipeB;

    const items = service.generateShoppingList(plan);
    const arrozItem = items.find(i => i.name.toLowerCase() === 'arroz bomba');

    expect(arrozItem).toBeDefined();
    expect(arrozItem?.totalQuantity).toBe(600); // 400g + 200g
    expect(arrozItem?.unit).toBe('g');
    expect(arrozItem?.sourceRecipes).toContain('Paella');
    expect(arrozItem?.sourceRecipes).toContain('Risotto');
  });

  it('preserves checked state when existing checked keys are provided', () => {
    const plan = createEmptyWeeklyPlan();
    plan.lunes.lunch = recipeA;

    const items = service.generateShoppingList(plan, ['arroz bomba_g']);
    const arrozItem = items.find(i => i.key === 'arroz bomba_g');
    expect(arrozItem?.checked).toBe(true);
  });

  it('formats shopping list items into clean plain text for copying', () => {
    const sampleItems = [
      {
        key: 'arroz bomba_g',
        name: 'Arroz bomba',
        totalQuantity: 600,
        unit: 'g',
        sourceRecipes: ['Paella'],
        checked: false,
      },
    ];

    const text = service.formatAsPlainText(sampleItems);
    expect(text).toContain('LISTA DE LA COMPRA - GOURMETCRAFT');
    expect(text).toContain('Arroz bomba: 600 g (Para: Paella)');
  });
});
