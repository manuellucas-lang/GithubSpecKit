import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingListView } from '@frontend/components/ShoppingListView';
import { ShoppingListItem } from '@shared/models/shopping_list';

const mockItems: ShoppingListItem[] = [
  {
    key: 'arroz bomba_g',
    name: 'Arroz bomba',
    totalQuantity: 600,
    unit: 'g',
    sourceRecipes: ['Paella', 'Risotto'],
    checked: false,
  },
  {
    key: 'aceite de oliva_ml',
    name: 'Aceite de oliva',
    totalQuantity: 100,
    unit: 'ml',
    sourceRecipes: ['Paella'],
    checked: true,
  },
];

describe('ShoppingListView Component Tests', () => {
  it('renders shopping items with quantities, units, and source recipes', () => {
    render(
      <ShoppingListView
        items={mockItems}
        onToggleItem={vi.fn()}
        onClearChecked={vi.fn()}
        onCopyText={vi.fn()}
        onNavigateToPlanner={vi.fn()}
      />
    );

    expect(screen.getByText('Arroz bomba')).toBeInTheDocument();
    expect(screen.getByText('600 g')).toBeInTheDocument();
    expect(screen.getByText('Aceite de oliva')).toBeInTheDocument();
    expect(screen.getByText('100 ml')).toBeInTheDocument();
    expect(screen.getByText(/para: paella, risotto/i)).toBeInTheDocument();
  });

  it('triggers item toggle callback when item row is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <ShoppingListView
        items={mockItems}
        onToggleItem={handleToggle}
        onClearChecked={vi.fn()}
        onCopyText={vi.fn()}
        onNavigateToPlanner={vi.fn()}
      />
    );

    const row = screen.getByText('Arroz bomba');
    fireEvent.click(row);
    expect(handleToggle).toHaveBeenCalledWith('arroz bomba_g');
  });

  it('calls onCopyText when copy button is clicked', () => {
    const handleCopy = vi.fn();
    render(
      <ShoppingListView
        items={mockItems}
        onToggleItem={vi.fn()}
        onClearChecked={vi.fn()}
        onCopyText={handleCopy}
        onNavigateToPlanner={vi.fn()}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copiar lista al portapapeles/i });
    fireEvent.click(copyBtn);
    expect(handleCopy).toHaveBeenCalled();
  });
});
