import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecipeImagePreferenceService } from '@frontend/services/recipe_image_preference_service';
import { RecipeImageCandidate } from '@shared/models/recipe_image_candidate';

describe('RecipeImagePreferenceService (Unit Tests)', () => {
  let service: RecipeImagePreferenceService;

  const mockCandidate: RecipeImageCandidate = {
    id: 'cand-1',
    keyword: 'paella',
    url: 'https://example.com/paella-new.jpg',
    thumbUrl: 'https://example.com/paella-new-thumb.jpg',
    altDescription: 'Paella con mariscos frescos',
    photographerName: 'Chef Lucas',
    photographerUrl: 'https://example.com/chef',
    isFallback: false,
  };

  beforeEach(() => {
    localStorage.clear();
    service = new RecipeImagePreferenceService();
  });

  it('returns null when no custom image preference has been set for a recipe', () => {
    const pref = service.getPreference('recipe-1');
    expect(pref).toBeNull();
  });

  it('saves and retrieves a custom image preference for a recipe', () => {
    service.setPreference('recipe-1', mockCandidate);
    const pref = service.getPreference('recipe-1');

    expect(pref).not.toBeNull();
    expect(pref?.recipeId).toBe('recipe-1');
    expect(pref?.imageId).toBe('cand-1');
    expect(pref?.url).toBe(mockCandidate.url);
    expect(pref?.photographerName).toBe('Chef Lucas');
    expect(pref?.isCustom).toBe(true);
    expect(pref?.updatedAt).toBeDefined();
  });

  it('clears a saved custom image preference and restores default', () => {
    service.setPreference('recipe-1', mockCandidate);
    expect(service.getPreference('recipe-1')).not.toBeNull();

    service.clearPreference('recipe-1');
    expect(service.getPreference('recipe-1')).toBeNull();
  });

  it('dispatches sync change events when setting or clearing preferences', () => {
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);

    service.setPreference('recipe-1', mockCandidate);
    expect(listener).toHaveBeenCalledWith({
      recipeId: 'recipe-1',
      preference: expect.objectContaining({
        recipeId: 'recipe-1',
        imageId: 'cand-1',
      }),
    });

    service.clearPreference('recipe-1');
    expect(listener).toHaveBeenCalledWith({
      recipeId: 'recipe-1',
      preference: null,
    });

    unsubscribe();
    service.setPreference('recipe-1', mockCandidate);
    expect(listener).toHaveBeenCalledTimes(2); // No new calls after unsubscribe
  });

  it('retrieves all stored preferences as a dictionary map', () => {
    service.setPreference('recipe-1', mockCandidate);
    service.setPreference('recipe-2', {
      ...mockCandidate,
      id: 'cand-2',
      url: 'https://example.com/soup.jpg',
    });

    const all = service.getAllPreferences();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['recipe-1']?.imageId).toBe('cand-1');
    expect(all['recipe-2']?.imageId).toBe('cand-2');
  });

  it('safely handles corrupted or invalid JSON in storage without throwing', () => {
    localStorage.setItem('recipe_catalog_image_preferences', 'invalid-json-content{');
    expect(service.getPreference('recipe-1')).toBeNull();
    expect(service.getAllPreferences()).toEqual({});

    localStorage.setItem('recipe_catalog_image_preferences', JSON.stringify({ 'recipe-1': 'not-an-object' }));
    expect(service.getPreference('recipe-1')).toBeNull();
  });

  it('notifies subscribers with preference: null when an entry is removed in notifyAll', () => {
    service.setPreference('recipe-1', mockCandidate);

    const listener = vi.fn();
    service.subscribe(listener);

    // Simulate another tab clearing the preference
    localStorage.setItem('recipe_catalog_image_preferences', JSON.stringify({}));
    window.dispatchEvent(new StorageEvent('storage', { key: 'recipe_catalog_image_preferences' }));

    expect(listener).toHaveBeenCalledWith({
      recipeId: 'recipe-1',
      preference: null,
    });
  });

  it('returns true when setPreference or clearPreference succeeds', () => {
    const setResult = service.setPreference('recipe-1', mockCandidate);
    expect(setResult).toBe(true);

    const clearResult = service.clearPreference('recipe-1');
    expect(clearResult).toBe(true);
  });

  it('returns false when storage write fails and does not notify subscribers', () => {
    const listener = vi.fn();
    service.subscribe(listener);

    const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const result = service.setPreference('recipe-1', mockCandidate);
    expect(result).toBe(false);
    expect(listener).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  it('returns false in clearPreference and does not notify subscribers when storage read fails', () => {
    service.setPreference('recipe-1', mockCandidate);

    const listener = vi.fn();
    service.subscribe(listener);

    const getItemSpy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: Access denied');
    });

    const result = service.clearPreference('recipe-1');
    expect(result).toBe(false);
    expect(listener).not.toHaveBeenCalled();

    getItemSpy.mockRestore();
  });

  it('returns true and emits preference: null when clearing an unpersisted preference with empty storage', () => {
    const listener = vi.fn();
    service.subscribe(listener);

    const result = service.clearPreference('recipe-not-found');
    expect(result).toBe(true);
    expect(listener).toHaveBeenCalledWith({
      recipeId: 'recipe-not-found',
      preference: null,
    });
  });

  it('validates each entry at runtime in storage and discards invalid entries while preserving valid ones', () => {
    const validEntry = {
      recipeId: 'recipe-valid',
      imageId: 'cand-1',
      url: 'https://example.com/paella.jpg',
      thumbUrl: 'https://example.com/paella-thumb.jpg',
      altDescription: 'Paella',
      photographerName: 'Chef',
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };

    const invalidEntry1 = {
      recipeId: 'recipe-invalid-1',
      imageId: 'cand-bad',
      // missing url
      isCustom: true,
    };

    const invalidEntry2 = 'string-not-an-object';

    const invalidEntry3 = {
      recipeId: 'recipe-invalid-3',
      imageId: 'cand-3',
      url: 'https://example.com/img.jpg',
      thumbUrl: 'https://example.com/thumb.jpg',
      altDescription: 'Alt',
      photographerName: 'Photographer',
      isCustom: true,
      updatedAt: 'not-a-valid-date',
    };

    localStorage.setItem(
      'recipe_catalog_image_preferences',
      JSON.stringify({
        'recipe-valid': validEntry,
        'recipe-invalid-1': invalidEntry1,
        'recipe-invalid-2': invalidEntry2,
        'recipe-invalid-3': invalidEntry3,
      })
    );

    const all = service.getAllPreferences();
    expect(Object.keys(all)).toEqual(['recipe-valid']);
    expect(all['recipe-valid']?.recipeId).toBe('recipe-valid');

    expect(service.getPreference('recipe-valid')).not.toBeNull();
    expect(service.getPreference('recipe-invalid-1')).toBeNull();
    expect(service.getPreference('recipe-invalid-2')).toBeNull();
    expect(service.getPreference('recipe-invalid-3')).toBeNull();
  });
});

