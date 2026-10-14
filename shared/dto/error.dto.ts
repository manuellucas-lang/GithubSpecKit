import { z } from 'zod';

/**
 * Standard RFC 7807 Problem Details error payload.
 */
export const ApiErrorResponseSchema = z.object({
  type: z.string().url().or(z.string().min(1)),
  title: z.string().min(1),
  status: z.number().int().min(400).max(599),
  detail: z.string(),
  instance: z.string(),
  invalidParams: z
    .array(
      z.object({
        name: z.string(),
        reason: z.string(),
      })
    )
    .optional(),
});

export type ApiErrorResponseDto = z.infer<typeof ApiErrorResponseSchema>;

export const HealthStatusSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  service: z.string(),
  uptimeSeconds: z.number().int().nonnegative(),
  timestamp: z.string(),
});

export type HealthStatusDto = z.infer<typeof HealthStatusSchema>;
