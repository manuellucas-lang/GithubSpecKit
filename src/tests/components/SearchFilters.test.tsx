import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFilters } from '../../presentation/components/SearchFilters';

describe('SearchFilters Component Tests', () => {
  it('renders search bar and triggers callback on input change', () => {
    const handleSearchChange = vi.fn();
    const handleToggleAllergen = vi.fn();

    render(
      <SearchFilters
        searchQuery=""
        onSearchChange={handleSearchChange}
        excludedAllergens={[]}
        onToggleExcludeAllergen={handleToggleAllergen}
        onMaxTotalMinutesChange={vi.fn()}
        onClearFilters={vi.fn()}
        totalResultsCount={6}
      />
    );

    const input = screen.getByPlaceholderText(/buscar recetas por nombre o ingredientes/i);
    fireEvent.change(input, { target: { value: 'salmon' } });
    expect(handleSearchChange).toHaveBeenCalledWith('salmon');
  });

  it('triggers allergen exclusion toggle when chip clicked', () => {
    const handleToggleAllergen = vi.fn();

    render(
      <SearchFilters
        searchQuery=""
        onSearchChange={vi.fn()}
        excludedAllergens={[]}
        onToggleExcludeAllergen={handleToggleAllergen}
        onMaxTotalMinutesChange={vi.fn()}
        onClearFilters={vi.fn()}
        totalResultsCount={6}
      />
    );

    const glutenBtn = screen.getByRole('button', { name: /excluir gluten/i });
    fireEvent.click(glutenBtn);
    expect(handleToggleAllergen).toHaveBeenCalledWith('GLUTEN');
  });
});
