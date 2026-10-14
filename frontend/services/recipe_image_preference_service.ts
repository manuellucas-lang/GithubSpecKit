import {
  RecipeImageCandidate,
  validateRecipeImageCandidate,
} from '@shared/models/recipe_image_candidate';
import {
  RecipeImagePreference,
  validateRecipeImagePreference,
} from '@shared/models/recipe_image_preference';
import { apiClient } from '../api/api_client';

export interface ImagePreferenceChangeEvent {
  recipeId: string;
  preference: RecipeImagePreference | null;
}

export type ImagePreferenceChangeListener = (event: ImagePreferenceChangeEvent) => void;

const STORAGE_KEY = 'recipe_catalog_image_preferences';

export class RecipeImagePreferenceService {
  private listeners: Set<ImagePreferenceChangeListener> = new Set();
  private lastKnownPreferences: Record<string, RecipeImagePreference> = {};

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

      // Asynchronously synchronize with backend preferences
      this.syncFromBackend();
    }
  }

  private async syncFromBackend(): Promise<void> {
    try {
      const serverPrefs = await apiClient.getPreferences();
      if (serverPrefs && typeof serverPrefs === 'object') {
        const local = this.readStorage() || {};
        const merged: Record<string, RecipeImagePreference> = { ...serverPrefs };
        for (const [key, localPref] of Object.entries(local)) {
          const serverPref = serverPrefs[key];
          if (!serverPref) {
            merged[key] = localPref;
          } else {
            const localTime = new Date(localPref.updatedAt).getTime();
            const serverTime = new Date(serverPref.updatedAt).getTime();
            merged[key] = localTime > serverTime ? localPref : serverPref;
          }
        }
        this.writeStorage(merged);
        this.notifyAll();
      }
    } catch {
      // Backend not yet reachable or offline, continue with local state
    }
  }

  private isValidPreference(entry: unknown): entry is RecipeImagePreference {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return false;
    }
    const candidate = entry as Record<string, unknown>;
    if (
      typeof candidate.recipeId !== 'string' ||
      typeof candidate.imageId !== 'string' ||
      typeof candidate.url !== 'string' ||
      typeof candidate.thumbUrl !== 'string' ||
      typeof candidate.altDescription !== 'string' ||
      typeof candidate.photographerName !== 'string' ||
      typeof candidate.isCustom !== 'boolean' ||
      typeof candidate.updatedAt !== 'string'
    ) {
      return false;
    }
    if (candidate.photographerUrl !== undefined && typeof candidate.photographerUrl !== 'string') {
      return false;
    }
    try {
      validateRecipeImagePreference(candidate as unknown as RecipeImagePreference);
      return true;
    } catch {
      return false;
    }
  }

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
        const validPreferences: Record<string, RecipeImagePreference> = {};
        for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
          if (this.isValidPreference(value)) {
            validPreferences[key] = value;
          }
        }
        return validPreferences;
      } catch {
        return {};
      }
    } catch {
      return null;
    }
  }

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
   * Retrieves the saved image preference for a specific recipe.
   *
   * @param recipeId - Identifier of the recipe.
   * @returns The saved preference object or null if none is saved.
   */
  getPreference(recipeId: string): RecipeImagePreference | null {
    if (!recipeId) return null;
    const all = this.readStorage();
    if (!all) return null;
    return all[recipeId] || null;
  }

  /**
   * Sets and persists a custom image candidate preference for a recipe.
   *
   * @param recipeId - Identifier of the recipe.
   * @param candidate - Selected image candidate.
   * @returns True if successfully persisted.
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

    // Optimistically push to backend
    apiClient.setPreference(recipeId, candidate).catch(() => {
      // Background sync retry or ignore
    });

    return true;
  }

  /**
   * Clears the custom image preference for a recipe, reverting to default.
   *
   * @param recipeId - Identifier of the recipe.
   * @returns True if successfully cleared.
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

    // Optimistically delete from backend
    apiClient.deletePreference(recipeId).catch(() => {
      // Background sync retry or ignore
    });

    return true;
  }

  /**
   * Returns a map of all saved recipe image preferences.
   *
   * @returns Object mapping recipe ID to image preference.
   */
  getAllPreferences(): Record<string, RecipeImagePreference> {
    return this.readStorage() || {};
  }

  /**
   * Subscribes a listener to preference changes across tabs or updates.
   *
   * @param callback - Callback receiving change events.
   * @returns Unsubscribe function.
   */
  subscribe(callback: ImagePreferenceChangeListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

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
