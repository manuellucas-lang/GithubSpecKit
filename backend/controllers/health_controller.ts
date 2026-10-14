import { FastifyInstance } from 'fastify';

/**
 * Registers REST API routes for health status and diagnostics.
 *
 * @param app - Fastify instance to attach routes to.
 */
export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/health', async () => {
    return {
      status: 'ok',
      service: 'recipe-catalog-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  });
}
