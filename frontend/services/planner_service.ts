import { DayOfWeek, MealSlot, WeeklyPlan, createEmptyWeeklyPlan } from '@shared/models/weekly_plan';
import { Recipe } from '@shared/models/recipe';
import { apiClient } from '../api/api_client';

const STORAGE_KEY = 'gourmet_weekly_meal_plan_v1';

export class PlannerService {
  private currentPlan: WeeklyPlan;

  constructor() {
    this.currentPlan = this.loadPlan();
    if (typeof window !== 'undefined') {
      this.syncFromBackend();
    }
  }

  private async syncFromBackend(): Promise<void> {
    try {
      const serverPlan = await apiClient.getWeeklyPlan();
      if (serverPlan && typeof serverPlan === 'object') {
        const hasServerMeals = Object.values(serverPlan).some(
          d => d && (d.lunch !== null || d.dinner !== null)
        );
        const hasLocalMeals = Object.values(this.currentPlan).some(
          d => d && (d.lunch !== null || d.dinner !== null)
        );

        if (hasServerMeals || !hasLocalMeals) {
          this.currentPlan = serverPlan;
          this.persistPlan();
        }
      }
    } catch {
      // Offline fallback
    }
  }

  private loadPlan(): WeeklyPlan {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as WeeklyPlan;
        }
      }
    } catch {
      // Fall back gracefully
    }
    return createEmptyWeeklyPlan();
  }

  private persistPlan(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentPlan));
      }
    } catch {
      // Storage error ignored
    }
  }

  /**
   * Retrieves the current weekly meal plan.
   *
   * @returns Cloned weekly plan object.
   */
  getWeeklyPlan(): WeeklyPlan {
    return { ...this.currentPlan };
  }

  /**
   * Assigns a recipe to a specific day and meal slot.
   *
   * @param day - Day of the week.
   * @param slot - Meal slot (lunch or dinner).
   * @param recipe - Recipe to assign.
   * @returns Updated weekly plan.
   */
  assignMeal(day: DayOfWeek, slot: MealSlot, recipe: Recipe): WeeklyPlan {
    this.currentPlan = {
      ...this.currentPlan,
      [day]: {
        ...this.currentPlan[day],
        [slot]: recipe,
      },
    };
    this.persistPlan();

    // Optimistically push to backend
    apiClient.assignMeal(day, slot, recipe).catch(() => {
      // Sync retry or ignore
    });

    return this.getWeeklyPlan();
  }

  /**
   * Clears a meal assignment from a specific day and slot.
   *
   * @param day - Day of the week.
   * @param slot - Meal slot.
   * @returns Updated weekly plan.
   */
  removeMeal(day: DayOfWeek, slot: MealSlot): WeeklyPlan {
    this.currentPlan = {
      ...this.currentPlan,
      [day]: {
        ...this.currentPlan[day],
        [slot]: null,
      },
    };
    this.persistPlan();
    return this.getWeeklyPlan();
  }

  /**
   * Resets all meal assignments across the entire week.
   *
   * @returns Cleared weekly plan.
   */
  clearPlan(): WeeklyPlan {
    this.currentPlan = createEmptyWeeklyPlan();
    this.persistPlan();

    // Optimistically clear backend plan
    apiClient.clearWeeklyPlan().catch(() => {
      // Sync retry or ignore
    });

    return this.getWeeklyPlan();
  }
}

export const plannerService = new PlannerService();
