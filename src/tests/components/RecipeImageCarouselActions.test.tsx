import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeImageCarouselModal } from '../../presentation/components/RecipeImageCarouselModal';
import { imageProviderClient } from '../../infrastructure/api/image_provider_client';

describe('RecipeImageCarouselModal Actions & Resilience (T016, T017, T018)', () => {
  const defaultProps = {
    isOpen: true,
    recipeId: 'rec-1',
    recipeTitle: 'Mushroom Risotto',
    keyword: 'mushroom risotto',
    currentImageUrl: 'https://example.com/custom.jpg',
    onSelectImage: vi.fn().mockReturnValue(true),
    onResetDefault: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers onClose when the Escape key is pressed', () => {
    render(<RecipeImageCarouselModal {...defaultProps} />);

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when clicking on the backdrop area outside the modal content', () => {
    render(<RecipeImageCarouselModal {...defaultProps} />);

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onResetDefault when clicking Restablecer por defecto', () => {
    render(<RecipeImageCarouselModal {...defaultProps} />);

    const resetBtn = screen.getByRole('button', { name: /Restablecer por defecto/i });
    fireEvent.click(resetBtn);

    expect(defaultProps.onResetDefault).toHaveBeenCalledTimes(1);
  });

  it('displays a friendly fallback notice when imageProviderClient returns an empty list', async () => {
    vi.spyOn(imageProviderClient, 'fetchImageCandidatesByKeyword').mockResolvedValueOnce([]);

    render(<RecipeImageCarouselModal {...defaultProps} keyword="empty-keyword" />);

    await waitFor(() => {
      expect(
        screen.getByText(/No se encontraron imágenes alternativas para este plato/i)
      ).toBeInTheDocument();
    });
  });

  it('displays error message when onSelectImage returns false and does not select candidate', async () => {
    const onSelectImage = vi.fn().mockReturnValue(false);
    render(<RecipeImageCarouselModal {...defaultProps} onSelectImage={onSelectImage} keyword="seafood paella" />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Seleccionar esta opción/i }).length).toBeGreaterThanOrEqual(1);
    });

    const selectButtons = screen.getAllByRole('button', { name: /Seleccionar esta opción/i });
    fireEvent.click(selectButtons[0]);

    expect(onSelectImage).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/No se pudo guardar la imagen seleccionada. Inténtalo de nuevo./i)
    ).toBeInTheDocument();
  });

  it('selects candidate and clears error message when onSelectImage returns true', async () => {
    let shouldSucceed = false;
    const onSelectImage = vi.fn(() => shouldSucceed);
    render(<RecipeImageCarouselModal {...defaultProps} onSelectImage={onSelectImage} keyword="seafood paella" />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Seleccionar esta opción/i }).length).toBeGreaterThanOrEqual(1);
    });

    const selectButtons = screen.getAllByRole('button', { name: /Seleccionar esta opción/i });
    fireEvent.click(selectButtons[0]);
    expect(
      screen.getByText(/No se pudo guardar la imagen seleccionada. Inténtalo de nuevo./i)
    ).toBeInTheDocument();

    shouldSucceed = true;
    fireEvent.click(selectButtons[0]);
    expect(
      screen.queryByText(/No se pudo guardar la imagen seleccionada. Inténtalo de nuevo./i)
    ).not.toBeInTheDocument();
  });

  it('does not retrigger focus reset when onClose identity changes while open', async () => {
    const onClose1 = vi.fn();
    const { rerender } = render(<RecipeImageCarouselModal {...defaultProps} onClose={onClose1} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeBtn = screen.getByLabelText(/Cerrar selector de imagen/i);
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    const onClose2 = vi.fn();
    rerender(<RecipeImageCarouselModal {...defaultProps} onClose={onClose2} />);

    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose2).toHaveBeenCalledTimes(1);
    expect(onClose1).not.toHaveBeenCalled();
  });
});
