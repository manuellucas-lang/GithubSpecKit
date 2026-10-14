import {
  RecipeListResponseDto,
  RecipeDto,
  RecipeFilterQueryDto,
} from '@shared/dto/recipe.dto';
import {
  RecipeImageCandidateDto,
  RecipeImagePreferenceDto,
  SavePreferenceRequestDto,
} from '@shared/dto/image.dto';
import {
  SaveDayMealRequestDto,
  ShoppingListDto,
} from '@shared/dto/planner.dto';
import { HealthStatusDto } from '@shared/dto/error.dto';
import { Recipe } from '@shared/models/recipe';
import { DayOfWeek, MealSlot, WeeklyPlan } from '@shared/models/weekly_plan';

/**
 * Custom error thrown when backend REST calls fail, preserving RFC 7807 metadata.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    public readonly detail: string,
    public readonly invalidParams?: Array<{ name: string; reason: string }>
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

/**
 * Standard typed HTTP client communicating with backend REST endpoints at /api/v1.
 */
export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const signal = options.signal ?? AbortSignal.timeout(8000);

    const response = await fetch(url, {
      ...options,
      headers,
      signal,
    });

    if (!response.ok) {
      let errorBody: {
        title?: string;
        detail?: string;
        invalidParams?: Array<{ name: string; reason: string }>;
      } = {};
      try {
        errorBody = await response.json();
      } catch {
        // Fallback if not JSON
      }

      throw new ApiError(
        response.status,
        errorBody.title || response.statusText,
        errorBody.detail || `Request to ${url} failed with status ${response.status}`,
        errorBody.invalidParams
      );
    }

    return (await response.json()) as T;
  }

  async getHealth(): Promise<HealthStatusDto> {
    return this.request<HealthStatusDto>('/health');
  }

  async getRecipes(filters?: RecipeFilterQueryDto): Promise<RecipeListResponseDto> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.maxCookingMinutes !== undefined) params.set('maxCookingMinutes', String(filters.maxCookingMinutes));
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    if (filters?.cuisine) params.set('cuisine', filters.cuisine);
    if (filters?.tag) params.set('tag', filters.tag);

    const qs = params.toString();
    return this.request<RecipeListResponseDto>(`/recipes${qs ? `?${qs}` : ''}`);
  }

  async getRecipeById(id: string): Promise<RecipeDto> {
    return this.request<RecipeDto>(`/recipes/${encodeURIComponent(id)}`);
  }

  async getImageCandidates(keyword: string, count: number = 6): Promise<RecipeImageCandidateDto[]> {
    const params = new URLSearchParams({
      keyword,
      count: String(count),
    });
    return this.request<RecipeImageCandidateDto[]>(`/images/candidates?${params.toString()}`);
  }

  async getPreferences(): Promise<Record<string, RecipeImagePreferenceDto>> {
    return this.request<Record<string, RecipeImagePreferenceDto>>('/preferences');
  }

  async getPreference(recipeId: string): Promise<RecipeImagePreferenceDto> {
    return this.request<RecipeImagePreferenceDto>(`/preferences/${encodeURIComponent(recipeId)}`);
  }

  async setPreference(recipeId: string, candidate: RecipeImageCandidateDto): Promise<RecipeImagePreferenceDto> {
    const payload: SavePreferenceRequestDto = { candidate };
    return this.request<RecipeImagePreferenceDto>(`/preferences/${encodeURIComponent(recipeId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deletePreference(recipeId: string): Promise<{ success: boolean; recipeId: string }> {
    return this.request<{ success: boolean; recipeId: string }>(`/preferences/${encodeURIComponent(recipeId)}`, {
      method: 'DELETE',
    });
  }

  async getWeeklyPlan(): Promise<WeeklyPlan> {
    return this.request<WeeklyPlan>('/planner');
  }

  /**
   * Assigns or clears a meal assignment in the weekly planner.
   *
   * @param day - Day of the week.
   * @param slot - Meal slot (lunch or dinner).
   * @param recipe - Recipe object or null to clear.
   * @returns Updated weekly plan from the backend.
   */
  async assignMeal(day: DayOfWeek, slot: MealSlot, recipe: Recipe | null): Promise<WeeklyPlan> {
    const payload: SaveDayMealRequestDto = {
      day,
      slot,
      recipeId: recipe ? recipe.id : null,
    };
    return this.request<WeeklyPlan>('/planner/meal', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async clearWeeklyPlan(): Promise<WeeklyPlan> {
    return this.request<WeeklyPlan>('/planner', {
      method: 'DELETE',
    });
  }

  async getShoppingList(): Promise<ShoppingListDto> {
    return this.request<ShoppingListDto>('/shopping-list');
  }
}

export const apiClient = new ApiClient();
