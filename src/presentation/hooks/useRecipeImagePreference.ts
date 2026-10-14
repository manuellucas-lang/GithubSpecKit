import { useState, useEffect } from 'react';
import { RecipeImageCandidate } from '../../domain/models/recipe_image_candidate';
import { RecipeImagePreference } from '../../domain/models/recipe_image_preference';
import { recipeImagePreferenceService } from '../../domain/services/recipe_image_preference_service';
import { useRecipeImage } from './useRecipeImage';

/**
 * Result state and action handlers returned by the useRecipeImagePreference hook.
 */
export interface UseRecipeImagePreferenceResult {
  imageUrl?: string;
  thumbUrl?: string;
  altDescription?: string;
  photographerName?: string;
  photographerUrl?: string;
  isCustom: boolean;
  isLoading: boolean;
  selectCandidate: (candidate: RecipeImageCandidate) => boolean;
  resetToDefault: () => boolean;
}

/**
 * Custom React hook that resolves and synchronizes recipe imagery in real-time.
 * It favors user-selected custom preferences if present, falling back to default
 * fetched recipe imagery, and reacts to cross-component preference updates.
 *
 * @param recipeId - The unique identifier of the target recipe.
 * @param keyword - The search term or title used for default image discovery.
 * @returns State properties containing active image URLs, metadata, and selection handlers.
 */
export function useRecipeImagePreference(recipeId: string, keyword: string): UseRecipeImagePreferenceResult {

  const { image: defaultImage, isLoading: isDefaultLoading } = useRecipeImage(keyword);
  const [preference, setPreference] = useState<RecipeImagePreference | null>(() => {
    return recipeImagePreferenceService.getPreference(recipeId);
  });

  useEffect(() => {
    // Initial fetch from storage
    setPreference(recipeImagePreferenceService.getPreference(recipeId));

    // Subscribe to internal service sync
    const unsubscribe = recipeImagePreferenceService.subscribe(event => {
      if (event.recipeId === recipeId) {
        setPreference(event.preference);
      }
    });

    // Listen to custom DOM event across windows/components
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ recipeId: string; preference: RecipeImagePreference | null }>;
      if (customEvent.detail && customEvent.detail.recipeId === recipeId) {
        setPreference(customEvent.detail.preference);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('recipe-image-changed', handleCustomEvent);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('recipe-image-changed', handleCustomEvent);
      }
    };
  }, [recipeId]);

  const selectCandidate = (candidate: RecipeImageCandidate): boolean => {
    return recipeImagePreferenceService.setPreference(recipeId, candidate);
  };

  const resetToDefault = (): boolean => {
    return recipeImagePreferenceService.clearPreference(recipeId);
  };

  const isCustom = preference !== null;
  const imageUrl = isCustom ? preference.url : defaultImage?.url;
  const thumbUrl = isCustom ? preference.thumbUrl : defaultImage?.thumbUrl;
  const altDescription = isCustom ? preference.altDescription : defaultImage?.altDescription;
  const photographerName = isCustom ? preference.photographerName : defaultImage?.photographerName;
  const photographerUrl = isCustom ? preference.photographerUrl : defaultImage?.photographerUrl;
  const isLoading = !isCustom && isDefaultLoading;

  return {
    imageUrl,
    thumbUrl,
    altDescription,
    photographerName,
    photographerUrl,
    isCustom,
    isLoading,
    selectCandidate,
    resetToDefault,
  };
}
