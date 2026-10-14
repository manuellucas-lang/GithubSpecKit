import { z } from 'zod';
import { RecipeDtoSchema } from './recipe.dto';

export const DayOfWeekSchema = z.enum([
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
]);

export const MealSlotSchema = z.enum(['lunch', 'dinner']);

export const DayPlanDtoSchema = z.object({
  lunch: RecipeDtoSchema.nullable(),
  dinner: RecipeDtoSchema.nullable(),
});

export const WeeklyPlanDtoSchema = z.record(DayOfWeekSchema, DayPlanDtoSchema);

export const SaveDayMealRequestSchema = z.object({
  day: DayOfWeekSchema,
  slot: MealSlotSchema,
  recipeId: z.string().nullable(),
});

export const ShoppingListItemDtoSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  totalQuantity: z.number().positive(),
  unit: z.string().min(1),
  sourceRecipes: z.array(z.string()),
  checked: z.boolean(),
});

export const ShoppingListResponseDtoSchema = z.object({
  items: z.array(ShoppingListItemDtoSchema),
  generatedAt: z.string(),
});

export type DayOfWeekDto = z.infer<typeof DayOfWeekSchema>;
export type MealSlotDto = z.infer<typeof MealSlotSchema>;
export type DayPlanDto = z.infer<typeof DayPlanDtoSchema>;
export type WeeklyPlanDto = z.infer<typeof WeeklyPlanDtoSchema>;
export type SaveDayMealRequestDto = z.infer<typeof SaveDayMealRequestSchema>;
export type ShoppingListItemDto = z.infer<typeof ShoppingListItemDtoSchema>;
export type ShoppingListResponseDto = z.infer<typeof ShoppingListResponseDtoSchema>;
export type ShoppingListDto = ShoppingListResponseDto;
