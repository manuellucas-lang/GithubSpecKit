import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeDetail } from '../../presentation/components/RecipeDetail';
import { Recipe } from '../../domain/models/recipe';

const mockRecipe: Recipe = {
  id: 'test-paella',
  title: 'Paella Especial',
  description: 'Arroz con mariscos frescos',
  keyword: 'paella',
  servings: 4,
  difficulty: 'Intermedio',
  cookingTime: {
    prepMinutes: 15,
    cookMinutes: 20,
    totalMinutes: 35,
    displayLabel: '35 min',
  },
  ingredients: [
    { id: '1', name: 'Arroz bomba', quantity: 300, unit: 'g' },
    { id: '2', name: 'Gambas', quantity: 200, unit: 'g' },
  ],
  steps: [
    { stepNumber: 1, title: 'Sofrito', instruction: 'Sofreír las gambas en la paella' },
    { stepNumber: 2, title: 'Arroz', instruction: 'Cocinar el arroz con el caldo' },
  ],
  allergens: ['CRUSTACEANS'],
};

describe('RecipeDetail Component Tests', () => {
  it('renders all recipe information including ingredients, cooking times, and allergens', () => {
    const handleBack = vi.fn();
    render(<RecipeDetail recipe={mockRecipe} onBack={handleBack} />);

    expect(screen.getByText('Paella Especial')).toBeInTheDocument();
    expect(screen.getByText('Arroz con mariscos frescos')).toBeInTheDocument();
    expect(screen.getByText('Arroz bomba')).toBeInTheDocument();
    expect(screen.getByText('300 g')).toBeInTheDocument();
    expect(screen.getByText('Gambas')).toBeInTheDocument();
    expect(screen.getByText('200 g')).toBeInTheDocument();
    expect(screen.getByText('Crustáceos')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('20 min')).toBeInTheDocument();
  });

  it('calls onBack when return button is clicked', () => {
    const handleBack = vi.fn();
    render(<RecipeDetail recipe={mockRecipe} onBack={handleBack} />);

    const backButton = screen.getByRole('button', { name: /volver al catálogo/i });
    fireEvent.click(backButton);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
