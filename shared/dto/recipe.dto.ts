import { z } from 'zod';

export const RecipeDifficultySchema = z.enum(['Fácil', 'Intermedio', 'Avanzado']);

export const RecipeStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  estimatedMinutes: z.number().nonnegative().optional(),
});

export const RecipeIngredientDtoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  notes: z.string().optional(),
});

export const CookingTimeDtoSchema = z.object({
  prepMinutes: z.number().int().nonnegative(),
  cookMinutes: z.number().int().nonnegative(),
  totalMinutes: z.number().int().nonnegative(),
  displayLabel: z.string(),
});

export const RecipeDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(100),
  description: z.string(),
  keyword: z.string().min(1),
  servings: z.number().int().positive(),
  difficulty: RecipeDifficultySchema,
  cookingTime: CookingTimeDtoSchema,
  ingredients: z.array(RecipeIngredientDtoSchema).min(1),
  steps: z.array(RecipeStepSchema).min(1),
  allergens: z.array(z.string()),
  imageUrl: z.string().optional(),
});

export const RecipeFilterQuerySchema = z.object({
  search: z.string().optional(),
  maxCookingMinutes: z.coerce.number().int().positive().optional(),
  difficulty: z.string().optional(),
  cuisine: z.string().optional(),
  tag: z.string().optional(),
});

export type RecipeDto = z.infer<typeof RecipeDtoSchema>;
export type RecipeIngredientDto = z.infer<typeof RecipeIngredientDtoSchema>;
export type CookingTimeDto = z.infer<typeof CookingTimeDtoSchema>;
export type RecipeFilterQueryDto = z.infer<typeof RecipeFilterQuerySchema>;

export interface RecipeListResponseDto {
  data: RecipeDto[];
  total: number;
}
