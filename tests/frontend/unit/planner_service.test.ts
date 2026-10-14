import { describe, it, expect, beforeEach } from 'vitest';
import { PlannerService } from '@frontend/services/planner_service';
import { Recipe } from '@shared/models/recipe';

const mockRecipe: Recipe = {
  id: 'test-recipe-1',
  title: 'Paella Especial',
  description: 'Arroz con marisco',
  keyword: 'paella',
  servings: 4,
  difficulty: 'Intermedio',
  cookingTime: { prepMinutes: 20, cookMinutes: 25, totalMinutes: 45, displayLabel: '45 min' },
  ingredients: [{ id: '1', name: 'Arroz', quantity: 300, unit: 'g' }],
  steps: [{ stepNumber: 1, title: 'Sofrito', instruction: 'Cocinar' }],
  allergens: [],
};

describe('PlannerService Unit Tests', () => {
  let service: PlannerService;

  beforeEach(() => {
    // Clear localStorage simulation
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    service = new PlannerService();
  });

  it('initializes with empty weekly plan for all 7 days', () => {
    const plan = service.getWeeklyPlan();
    expect(plan.lunes.lunch).toBeNull();
    expect(plan.domingo.dinner).toBeNull();
  });

  it('assigns a recipe to a specific day and slot', () => {
    const updated = service.assignMeal('miercoles', 'lunch', mockRecipe);
    expect(updated.miercoles.lunch?.id).toBe('test-recipe-1');
    expect(updated.miercoles.dinner).toBeNull();
  });

  it('removes a recipe from a day and slot', () => {
    service.assignMeal('viernes', 'dinner', mockRecipe);
    const updated = service.removeMeal('viernes', 'dinner');
    expect(updated.viernes.dinner).toBeNull();
  });

  it('clears entire weekly plan', () => {
    service.assignMeal('lunes', 'lunch', mockRecipe);
    service.assignMeal('martes', 'dinner', mockRecipe);
    const cleared = service.clearPlan();
    expect(cleared.lunes.lunch).toBeNull();
    expect(cleared.martes.dinner).toBeNull();
  });
});
