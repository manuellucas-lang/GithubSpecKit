import { Recipe } from './recipe';

/**
 * Valid days of the week in the weekly meal planner.
 */
export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

/**
 * Meal slots within a single day.
 */
export type MealSlot = 'lunch' | 'dinner';

/**
 * Plan for a single day containing lunch and dinner recipe assignments.
 */
export interface DayPlan {
  lunch: Recipe | null;
  dinner: Recipe | null;
}

/**
 * Full 7-day meal plan.
 */
export type WeeklyPlan = Record<DayOfWeek, DayPlan>;

/**
 * Ordered list of days of the week with localized labels.
 */
export const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

/**
 * Factory creating an empty 7-day meal plan with unassigned slots.
 */
export function createEmptyWeeklyPlan(): WeeklyPlan {
  return {
    lunes: { lunch: null, dinner: null },
    martes: { lunch: null, dinner: null },
    miercoles: { lunch: null, dinner: null },
    jueves: { lunch: null, dinner: null },
    viernes: { lunch: null, dinner: null },
    sabado: { lunch: null, dinner: null },
    domingo: { lunch: null, dinner: null },
  };
}
