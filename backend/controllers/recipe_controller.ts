import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SQLiteRecipeRepository } from '../repositories/sqlite_recipe_repository';
import { RecipeFilterQuerySchema } from '@shared/dto/recipe.dto';

export function registerRecipeRoutes(app: FastifyInstance, repository: SQLiteRecipeRepository): void {
  app.get('/api/v1/recipes', async (request: FastifyRequest, reply: FastifyReply) => {
    const queryResult = RecipeFilterQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Invalid Filter Parameters',
        status: 400,
        detail: 'One or more filter parameters are invalid',
        instance: request.url,
        invalidParams: queryResult.error.issues.map((e) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
    }

    const recipes = repository.findAll(queryResult.data);
    return {
      data: recipes,
      total: recipes.length,
    };
  });

  app.get('/api/v1/recipes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const recipe = repository.findById(id);

    if (!recipe) {
      return reply.status(404).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Recipe Not Found',
        status: 404,
        detail: `No recipe found with identifier "${id}"`,
        instance: request.url,
      });
    }

    return recipe;
  });
}
