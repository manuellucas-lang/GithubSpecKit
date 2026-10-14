import fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Database from 'better-sqlite3';
import { initDatabase } from './database/sqlite';
import { SQLiteRecipeRepository } from './repositories/sqlite_recipe_repository';
import { SQLitePreferenceRepository } from './repositories/sqlite_preference_repository';
import { SQLitePlannerRepository } from './repositories/sqlite_planner_repository';
import { ImageProviderGateway } from './services/image_provider_gateway';
import { registerHealthRoutes } from './controllers/health_controller';
import { registerRecipeRoutes } from './controllers/recipe_controller';
import { registerImageRoutes } from './controllers/image_controller';
import { registerPreferenceRoutes } from './controllers/preference_controller';
import { registerPlannerRoutes } from './controllers/planner_controller';

export interface AppOptions {
  db?: Database.Database;
  logger?: boolean | object;
}

/**
 * Builds and configures a Fastify application instance with security middleware,
 * repositories, services, and REST API controllers.
 *
 * @param options - Application setup options.
 * @returns Configured Fastify instance ready to listen or inject requests.
 */
export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const app = fastify({
    logger: options.logger ?? {
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label: string) => ({ level: label }),
      },
    },
  });

  // Security plugins
  await app.register(helmet, {
    contentSecurityPolicy: false, // Allows flexible local API serving
  });

  await app.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  // Shared database and repositories
  const db = options.db || initDatabase();
  const recipeRepo = new SQLiteRecipeRepository(db);
  const preferenceRepo = new SQLitePreferenceRepository(db);
  const plannerRepo = new SQLitePlannerRepository(db);
  const imageGateway = new ImageProviderGateway();

  // Register REST controllers
  await registerHealthRoutes(app);
  registerRecipeRoutes(app, recipeRepo);
  registerImageRoutes(app, imageGateway);
  registerPreferenceRoutes(app, preferenceRepo);
  registerPlannerRoutes(app, plannerRepo);

  // Central error handler (RFC 7807)
  app.setErrorHandler((error: FastifyError, request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      type: 'https://tools.ietf.org/html/rfc7807',
      title: error.name || 'Internal Server Error',
      status: statusCode,
      detail: statusCode >= 500
        ? 'An unexpected error occurred processing your request'
        : error.message,
      instance: request.url,
    });
  });

  return app;
}
