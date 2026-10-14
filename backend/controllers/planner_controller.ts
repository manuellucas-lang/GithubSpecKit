import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SQLitePlannerRepository } from '../repositories/sqlite_planner_repository';
import { SaveDayMealRequestSchema } from '@shared/dto/planner.dto';
import { ShoppingListItem, buildIngredientKey } from '@shared/models/shopping_list';
import { DAYS_OF_WEEK } from '@shared/models/weekly_plan';

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
    const updated = repository.setMeal(day, slot, recipeId);
    return updated;
  });

  app.delete('/api/v1/planner', async () => {
    return repository.clearPlan();
  });

  app.get('/api/v1/shopping-list', async () => {
    const plan = repository.getPlan();
    const map = new Map<string, ShoppingListItem>();

    for (const { key: dayKey } of DAYS_OF_WEEK) {
      const dayPlan = plan[dayKey];
      if (!dayPlan) continue;

      const meals = [dayPlan.lunch, dayPlan.dinner];
      for (const recipe of meals) {
        if (!recipe || !Array.isArray(recipe.ingredients)) continue;

        for (const ing of recipe.ingredients) {
          const key = buildIngredientKey(ing.name, ing.unit);
          const existing = map.get(key);

          if (existing) {
            existing.totalQuantity += ing.quantity;
            if (!existing.sourceRecipes.includes(recipe.title)) {
              existing.sourceRecipes.push(recipe.title);
            }
          } else {
            map.set(key, {
              key,
              name: ing.name,
              totalQuantity: ing.quantity,
              unit: ing.unit,
              sourceRecipes: [recipe.title],
              checked: false,
            });
          }
        }
      }
    }

    return {
      items: Array.from(map.values()),
      generatedAt: new Date().toISOString(),
    };
  });
}
