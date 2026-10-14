import { z } from 'zod';

export const ImageCandidatesQuerySchema = z.object({
  keyword: z.string().min(1),
  count: z.coerce.number().int().min(1).max(10).default(6),
});

export const RecipeImageCandidateDtoSchema = z.object({
  id: z.string().min(1),
  keyword: z.string().min(1),
  url: z.string().min(1),
  thumbUrl: z.string().min(1),
  altDescription: z.string(),
  photographerName: z.string(),
  photographerUrl: z.string().optional(),
  isFallback: z.boolean(),
});

export const RecipeImagePreferenceDtoSchema = z.object({
  recipeId: z.string().min(1),
  imageId: z.string().min(1),
  url: z.string().min(1),
  thumbUrl: z.string().min(1),
  altDescription: z.string(),
  photographerName: z.string(),
  photographerUrl: z.string().optional(),
  isCustom: z.boolean(),
  updatedAt: z.string().refine((val: string) => !isNaN(Date.parse(val)), {
    message: 'Must be a valid ISO-8601 timestamp string',
  }),
});

export const SavePreferenceRequestSchema = z.object({
  candidate: RecipeImageCandidateDtoSchema,
});

export type ImageCandidatesQueryDto = z.infer<typeof ImageCandidatesQuerySchema>;
export type RecipeImageCandidateDto = z.infer<typeof RecipeImageCandidateDtoSchema>;
export type RecipeImagePreferenceDto = z.infer<typeof RecipeImagePreferenceDtoSchema>;
export type SavePreferenceRequestDto = z.infer<typeof SavePreferenceRequestSchema>;
