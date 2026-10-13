import { Recipe } from './recipe';

export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export type MealSlot = 'lunch' | 'dinner';

export interface DayPlan {
  lunch: Recipe | null;
  dinner: Recipe | null;
}

export type WeeklyPlan = Record<DayOfWeek, DayPlan>;

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

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
