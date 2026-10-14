import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyPlanner } from '@frontend/components/WeeklyPlanner';
import { createEmptyWeeklyPlan } from '@shared/models/weekly_plan';
import { Recipe } from '@shared/models/recipe';

const mockRecipe: Recipe = {
  id: 'rec-test',
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

describe('WeeklyPlanner Component Tests', () => {
  it('renders all 7 days of the week', () => {
    const emptyPlan = createEmptyWeeklyPlan();
    render(
      <WeeklyPlanner
        plan={emptyPlan}
        recipes={[mockRecipe]}
        onAssignMeal={vi.fn()}
        onRemoveMeal={vi.fn()}
        onClearPlan={vi.fn()}
        onOpenRecipeDetail={vi.fn()}
      />
    );

    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Miércoles')).toBeInTheDocument();
    expect(screen.getByText('Domingo')).toBeInTheDocument();
  });

  it('renders assigned recipe in slot and triggers remove when trash button clicked', () => {
    const plan = createEmptyWeeklyPlan();
    plan.lunes.lunch = mockRecipe;
    const handleRemove = vi.fn();

    render(
      <WeeklyPlanner
        plan={plan}
        recipes={[mockRecipe]}
        onAssignMeal={vi.fn()}
        onRemoveMeal={handleRemove}
        onClearPlan={vi.fn()}
        onOpenRecipeDetail={vi.fn()}
      />
    );

    expect(screen.getByText('Paella Especial')).toBeInTheDocument();
    const removeBtn = screen.getByLabelText(/quitar receta de almuerzo del lunes/i);
    fireEvent.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith('lunes', 'lunch');
  });
});
