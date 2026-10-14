import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ImageProviderGateway } from '../services/image_provider_gateway';
import { ImageCandidatesQuerySchema } from '@shared/dto/image.dto';

export function registerImageRoutes(app: FastifyInstance, gateway: ImageProviderGateway): void {
  app.get('/api/v1/images/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = ImageCandidatesQuerySchema.safeParse(request.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Invalid Query Parameters',
        status: 400,
        detail: 'Keyword is required and must not be empty.',
        instance: request.url,
        invalidParams: parseResult.error.issues.map((e: z.ZodIssue) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
    }

    const { keyword, count } = parseResult.data;
    const candidates = await gateway.fetchCandidates(keyword, count);
    return candidates;
  });
}
