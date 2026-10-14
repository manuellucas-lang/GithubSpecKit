import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SQLitePreferenceRepository } from '../repositories/sqlite_preference_repository';
import { SavePreferenceRequestSchema } from '@shared/dto/image.dto';

/**
 * Registers REST API routes for recipe image preferences management.
 *
 * @param app - Fastify instance to attach routes to.
 * @param repository - Preference repository managing custom image persistence.
 */
export function registerPreferenceRoutes(app: FastifyInstance, repository: SQLitePreferenceRepository): void {
  app.get('/api/v1/preferences', async () => {
    return repository.getAll();
  });

  app.get('/api/v1/preferences/:recipeId', async (request: FastifyRequest<{ Params: { recipeId: string } }>, reply: FastifyReply) => {
    const { recipeId } = request.params;
    const pref = repository.get(recipeId);

    if (!pref) {
      return reply.status(404).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Preference Not Found',
        status: 404,
        detail: `No custom image preference found for recipe "${recipeId}"`,
        instance: request.url,
      });
    }

    return pref;
  });

  app.put('/api/v1/preferences/:recipeId', async (request: FastifyRequest<{ Params: { recipeId: string } }>, reply: FastifyReply) => {
    const { recipeId } = request.params;
    const parseResult = SavePreferenceRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Invalid Request Payload',
        status: 400,
        detail: 'Candidate must satisfy the RecipeImageCandidate contract',
        instance: request.url,
        invalidParams: parseResult.error.issues.map((e: z.ZodIssue) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
    }

    if (!repository.hasRecipe(recipeId)) {
      return reply.status(404).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Recipe Not Found',
        status: 404,
        detail: `No recipe found with identifier "${recipeId}"`,
        instance: request.url,
      });
    }

    const { candidate } = parseResult.data;
    const saved = repository.set(recipeId, candidate);
    return saved;
  });

  app.delete('/api/v1/preferences/:recipeId', async (request: FastifyRequest<{ Params: { recipeId: string } }>) => {
    const { recipeId } = request.params;
    repository.delete(recipeId);
    return { success: true, recipeId };
  });
}
