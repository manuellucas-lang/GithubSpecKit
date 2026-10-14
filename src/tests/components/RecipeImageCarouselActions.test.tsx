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
    onSelectImage: vi.fn(),
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
});
