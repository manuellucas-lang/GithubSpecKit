import { RecipeImageCandidate, validateRecipeImageCandidate } from '../models/recipe_image_candidate';
import { RecipeImagePreference, validateRecipeImagePreference } from '../models/recipe_image_preference';

export interface ImagePreferenceChangeEvent {
  recipeId: string;
  preference: RecipeImagePreference | null;
}

export type ImagePreferenceChangeListener = (event: ImagePreferenceChangeEvent) => void;

const STORAGE_KEY = 'recipe_catalog_image_preferences';

export class RecipeImagePreferenceService {
  private listeners: Set<ImagePreferenceChangeListener> = new Set();

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

  private writeStorage(data: Record<string, RecipeImagePreference>): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getPreference(recipeId: string): RecipeImagePreference | null {
    if (!recipeId) return null;
    const all = this.readStorage();
    return all[recipeId] || null;
  }

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

  clearPreference(recipeId: string): void {
    const all = this.readStorage();
    if (all[recipeId]) {
      delete all[recipeId];
      this.writeStorage(all);
    }
    this.emitChange({ recipeId, preference: null });
  }

  getAllPreferences(): Record<string, RecipeImagePreference> {
    return this.readStorage();
  }

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
    const all = this.readStorage();
    Object.keys(all).forEach(recipeId => {
      this.emitChange({ recipeId, preference: all[recipeId] });
    });
  }
}

export const recipeImagePreferenceService = new RecipeImagePreferenceService();
