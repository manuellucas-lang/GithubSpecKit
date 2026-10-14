import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecipeImagePreference } from '@frontend/hooks/useRecipeImagePreference';
import { recipeImagePreferenceService } from '@frontend/services/recipe_image_preference_service';

describe('useRecipeImagePreference hook (Integration Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initially resolves default keyword-based image when no custom preference exists', async () => {
    const { result } = renderHook(() => useRecipeImagePreference('rec-test-1', 'seafood paella'));

    expect(result.current.isCustom).toBe(false);

    await waitFor(() => {
      expect(result.current.imageUrl).toBeDefined();
    });
  });

  it('updates reactively when a custom preference is set through the service', () => {
    const { result } = renderHook(() => useRecipeImagePreference('rec-test-1', 'seafood paella'));

    act(() => {
      recipeImagePreferenceService.setPreference('rec-test-1', {
        id: 'new-cand',
        keyword: 'seafood paella',
        url: 'https://images.example.com/custom-paella.jpg',
        thumbUrl: 'https://images.example.com/custom-paella-thumb.jpg',
        altDescription: 'Custom Paella Image',
        photographerName: 'Artisan Chef',
        isFallback: false,
      });
    });

    expect(result.current.isCustom).toBe(true);
    expect(result.current.imageUrl).toBe('https://images.example.com/custom-paella.jpg');
    expect(result.current.photographerName).toBe('Artisan Chef');
  });

  it('resets back to default when clearPreference is invoked', () => {
    const { result } = renderHook(() => useRecipeImagePreference('rec-test-1', 'seafood paella'));

    act(() => {
      recipeImagePreferenceService.setPreference('rec-test-1', {
        id: 'new-cand',
        keyword: 'seafood paella',
        url: 'https://images.example.com/custom-paella.jpg',
        thumbUrl: 'https://images.example.com/custom-paella-thumb.jpg',
        altDescription: 'Custom Paella Image',
        photographerName: 'Artisan Chef',
        isFallback: false,
      });
    });
    expect(result.current.isCustom).toBe(true);

    act(() => {
      result.current.resetToDefault();
    });

    expect(result.current.isCustom).toBe(false);
  });
});
