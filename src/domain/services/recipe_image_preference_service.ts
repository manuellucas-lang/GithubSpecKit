import { RecipeImageCandidate, validateRecipeImageCandidate } from '../models/recipe_image_candidate';
import { RecipeImagePreference, validateRecipeImagePreference } from '../models/recipe_image_preference';

/**
 * Event payload emitted when a recipe image preference changes or resets.
 */
export interface ImagePreferenceChangeEvent {
  recipeId: string;
  preference: RecipeImagePreference | null;
}

/**
 * Callback function listener for recipe image preference changes.
 */
export type ImagePreferenceChangeListener = (event: ImagePreferenceChangeEvent) => void;

const STORAGE_KEY = 'recipe_catalog_image_preferences';

/**
 * Service managing persistence, retrieval, and reactive synchronization of user-selected
 * recipe image preferences across views and browser storage events.
 */
export class RecipeImagePreferenceService {
  private listeners: Set<ImagePreferenceChangeListener> = new Set();

  /**
   * Initializes the preference service and registers cross-tab storage event listeners.
   */
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
          // Notify general reload
          this.notifyAll();
        }
      });
    }
  }

  /**
   * Safely reads stored image preferences from localStorage.
   *
   * @returns A map of recipe IDs to their stored preferences.
   */
  private readStorage(): Record<string, RecipeImagePreference> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {};
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /**
   * Safely writes the current map of recipe image preferences to localStorage.
   *
   * @param data - The dictionary of preferences to persist.
   */
  private writeStorage(data: Record<string, RecipeImagePreference>): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Retrieves the current user-selected image preference for a given recipe ID.
   *
   * @param recipeId - The unique identifier of the recipe.
   * @returns The saved preference, or null if using default image.
   */
  getPreference(recipeId: string): RecipeImagePreference | null {
    if (!recipeId) return null;
    const all = this.readStorage();
    return all[recipeId] || null;
  }

  /**
   * Persists a custom image candidate preference for a recipe and notifies active subscribers.
   *
   * @param recipeId - The unique identifier of the recipe.
   * @param candidate - The candidate image chosen by the user.
   */
  setPreference(recipeId: string, candidate: RecipeImageCandidate): void {
    validateRecipeImageCandidate(candidate);

    const preference: RecipeImagePreference = {
      recipeId,
      imageId: candidate.id,
      url: candidate.url,
      thumbUrl: candidate.thumbUrl,
      altDescription: candidate.altDescription,
      photographerName: candidate.photographerName,
      photographerUrl: candidate.photographerUrl,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };

    validateRecipeImagePreference(preference);

    const all = this.readStorage();
    all[recipeId] = preference;
    this.writeStorage(all);

    this.emitChange({ recipeId, preference });
  }

  /**
   * Clears any custom preference for a recipe, reverting it to the default image,
   * and notifies all subscribers.
   *
   * @param recipeId - The unique identifier of the recipe to reset.
   */
  clearPreference(recipeId: string): void {
    const all = this.readStorage();
    if (all[recipeId]) {
      delete all[recipeId];
      this.writeStorage(all);
    }
    this.emitChange({ recipeId, preference: null });
  }

  /**
   * Retrieves all saved preferences across all recipes.
   *
   * @returns A dictionary of all persisted recipe preferences.
   */
  getAllPreferences(): Record<string, RecipeImagePreference> {
    return this.readStorage();
  }

  /**
   * Subscribes a listener callback to reactive preference changes.
   *
   * @param callback - The listener to execute when a preference changes.
   * @returns An unsubscribe cleanup function.
   */
  subscribe(callback: ImagePreferenceChangeListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Emits change events to internal subscribers and dispatches a DOM CustomEvent.
   *
   * @param event - The change event payload.
   */
  private emitChange(event: ImagePreferenceChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch {
        // Safe listener execution
      }
    });

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(
          new CustomEvent('recipe-image-changed', {
            detail: event,
          })
        );
      } catch {
        // Ignore custom event dispatch errors in restricted test environments
      }
    }
  }

  /**
   * Re-evaluates and notifies all subscribers about all stored preferences.
   */
  private notifyAll(): void {
    const all = this.readStorage();
    Object.keys(all).forEach(recipeId => {
      this.emitChange({ recipeId, preference: all[recipeId] });
    });
  }
}

export const recipeImagePreferenceService = new RecipeImagePreferenceService();

