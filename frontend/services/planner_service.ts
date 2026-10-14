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
        this.currentPlan = serverPlan;
        this.persistPlan();
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

  getWeeklyPlan(): WeeklyPlan {
    return { ...this.currentPlan };
  }

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
