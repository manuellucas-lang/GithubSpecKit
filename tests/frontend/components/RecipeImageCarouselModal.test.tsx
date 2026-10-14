import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeImageCarouselModal } from '@frontend/components/RecipeImageCarouselModal';
import { imageProviderClient } from '@frontend/services/image_provider_client';

describe('RecipeImageCarouselModal Component', () => {
  const defaultProps = {
    isOpen: true,
    recipeId: 'rec-paella-1',
    recipeTitle: 'Paella de Marisco Tradicional',
    keyword: 'seafood paella',
    currentImageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1200&q=80',
    onSelectImage: vi.fn().mockReturnValue(true),
    onResetDefault: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal dialog when isOpen is true with title and recipe name', async () => {
    render(<RecipeImageCarouselModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Paella de Marisco Tradicional')).toBeInTheDocument();
    expect(screen.getByText(/Seleccionar imagen alternativa/i)).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<RecipeImageCarouselModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays candidate images and photographer credits after loading', async () => {
    vi.spyOn(imageProviderClient, 'fetchImageCandidatesByKeyword').mockResolvedValueOnce([
      {
        id: 'paella-1',
        keyword: 'seafood paella',
        url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=300&q=80',
        altDescription: 'Paella tradicional de marisco',
        photographerName: 'Chrissie Kremer',
        isFallback: false,
      },
      {
        id: 'paella-2',
        keyword: 'seafood paella',
        url: 'https://images.unsplash.com/photo-2',
        thumbUrl: 'https://images.unsplash.com/photo-2-thumb',
        altDescription: 'Paella 2',
        photographerName: 'Annie Spratt',
        isFallback: false,
      },
      {
        id: 'paella-3',
        keyword: 'seafood paella',
        url: 'https://images.unsplash.com/photo-3',
        thumbUrl: 'https://images.unsplash.com/photo-3-thumb',
        altDescription: 'Paella 3',
        photographerName: 'Chunli Ju',
        isFallback: false,
      },
    ]);

    render(<RecipeImageCarouselModal {...defaultProps} />);

    await waitFor(() => {
      const candidates = screen.getAllByRole('button', { name: /Seleccionar esta opción/i });
      expect(candidates.length).toBeGreaterThanOrEqual(3);
    });

    expect(screen.getByText(/Chrissie Kremer/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<RecipeImageCarouselModal {...defaultProps} />);
    const closeBtn = screen.getByLabelText(/Cerrar selector de imagen/i);
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
