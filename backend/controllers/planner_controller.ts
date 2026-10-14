import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SQLitePlannerRepository } from '../repositories/sqlite_planner_repository';
import { SaveDayMealRequestSchema } from '@shared/dto/planner.dto';
import { generateShoppingListFromPlan } from '@shared/models/shopping_list';

export function registerPlannerRoutes(app: FastifyInstance, repository: SQLitePlannerRepository): void {
  app.get('/api/v1/planner', async () => {
    return repository.getPlan();
  });

  app.put('/api/v1/planner/meal', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = SaveDayMealRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Invalid Meal Assignment Payload',
        status: 400,
        detail: 'Day and slot must be valid',
        instance: request.url,
        invalidParams: parseResult.error.issues.map((e: z.ZodIssue) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
    }

    const { day, slot, recipeId } = parseResult.data;

    if (recipeId && !repository.hasRecipe(recipeId)) {
      return reply.status(404).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Recipe Not Found',
        status: 404,
        detail: `No recipe found with identifier "${recipeId}"`,
        instance: request.url,
      });
    }

    const updated = repository.setMeal(day, slot, recipeId);
    return updated;
  });

  app.delete('/api/v1/planner', async () => {
    return repository.clearPlan();
  });

  app.get('/api/v1/shopping-list', async () => {
    const plan = repository.getPlan();
    const items = generateShoppingListFromPlan(plan);

    return {
      items,
      generatedAt: new Date().toISOString(),
    };
  });
}
