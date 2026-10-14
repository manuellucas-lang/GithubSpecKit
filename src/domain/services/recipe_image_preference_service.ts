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
  private lastKnownPreferences: Record<string, RecipeImagePreference> = {};

  /**
   * Initializes the preference service and registers cross-tab storage event listeners.
   */
  constructor() {
    this.lastKnownPreferences = this.readStorage() || {};

    if (typeof window !== 'undefined') {
      try {
        window.addEventListener('storage', (e: StorageEvent) => {
          if (e.key === STORAGE_KEY) {
            this.notifyAll();
          }
        });
      } catch {
        // Safe listener registration in restricted environments
      }
    }
  }

  /**
   * Safely reads stored image preferences from localStorage, validating object structure.
   *
   * @returns A map of recipe IDs to their stored preferences, or null if storage access failed.
   */
  private readStorage(): Record<string, RecipeImagePreference> | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      const storage = window.localStorage;
      if (!storage) {
        return null;
      }
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return {};
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return {};
        }
        return parsed as Record<string, RecipeImagePreference>;
      } catch {
        return {};
      }
    } catch {
      return null;
    }
  }

  /**
   * Safely writes the current map of recipe image preferences to localStorage.
   *
   * @param data - The dictionary of preferences to persist.
   * @returns Boolean indicating whether the write operation succeeded.
   */
  private writeStorage(data: Record<string, RecipeImagePreference>): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      const storage = window.localStorage;
      if (!storage) {
        return false;
      }
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the current user-selected image preference for a given recipe ID.
   * Validates that the stored entry matches the expected preference structure.
   *
   * @param recipeId - The unique identifier of the recipe.
   * @returns The saved preference, or null if using default image.
   */
  getPreference(recipeId: string): RecipeImagePreference | null {
    if (!recipeId) return null;
    const all = this.readStorage();
    if (!all) return null;
    const candidate = all[recipeId];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return null;
    }
    if (typeof candidate.recipeId !== 'string' || typeof candidate.url !== 'string') {
      return null;
    }
    return candidate;
  }

  /**
   * Persists a custom image candidate preference for a recipe and notifies active subscribers
   * only when storage write succeeds.
   *
   * @param recipeId - The unique identifier of the recipe.
   * @param candidate - The candidate image chosen by the user.
   * @returns Boolean indicating whether the preference was successfully saved and emitted.
   */
  setPreference(recipeId: string, candidate: RecipeImageCandidate): boolean {
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
    if (!all) return false;

    all[recipeId] = preference;
    const isSaved = this.writeStorage(all);

    if (!isSaved) return false;

    this.lastKnownPreferences[recipeId] = preference;
    this.emitChange({ recipeId, preference });
    return true;
  }

  /**
   * Clears any custom preference for a recipe, reverting it to the default image,
   * and notifies all subscribers if removal succeeds.
   * Returns false without emitting changes if reading storage fails.
   *
   * @param recipeId - The unique identifier of the recipe to reset.
   * @returns Boolean indicating whether the preference was successfully cleared and emitted.
   */
  clearPreference(recipeId: string): boolean {
    const all = this.readStorage();
    if (all === null) {
      return false;
    }

    if (all[recipeId]) {
      delete all[recipeId];
      const isSaved = this.writeStorage(all);
      if (!isSaved) return false;
    }
    delete this.lastKnownPreferences[recipeId];
    this.emitChange({ recipeId, preference: null });
    return true;
  }

  /**
   * Retrieves all saved preferences across all recipes.
   *
   * @returns A dictionary of all persisted recipe preferences.
   */
  getAllPreferences(): Record<string, RecipeImagePreference> {
    return this.readStorage() || {};
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
   * Compares stored preferences against previously known preferences across all keys.
   * Emits preference: null for deleted recipes and broadcasts updates for active preferences.
   */
  private notifyAll(): void {
    const current = this.readStorage();
    if (!current) return;

    const allRecipeIds = new Set([
      ...Object.keys(this.lastKnownPreferences),
      ...Object.keys(current),
    ]);

    allRecipeIds.forEach(recipeId => {
      const currentPref = current[recipeId] || null;
      const prevPref = this.lastKnownPreferences[recipeId] || null;

      if (JSON.stringify(currentPref) !== JSON.stringify(prevPref)) {
        this.emitChange({ recipeId, preference: currentPref });
      }
    });

    this.lastKnownPreferences = current;
  }
}

export const recipeImagePreferenceService = new RecipeImagePreferenceService();


