import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '@backend/app';
import { initDatabase } from '@backend/database/sqlite';
import { seedRecipes } from '@backend/database/seeds/recipes.seed';
import Database from 'better-sqlite3';

describe('Preferences API Contract Tests', () => {
  let app: FastifyInstance;
  let db: Database.Database;

  const validCandidate = {
    id: 'cand-custom-1',
    keyword: 'seafood paella',
    url: 'https://images.example.com/custom-paella.jpg',
    thumbUrl: 'https://images.example.com/custom-paella-thumb.jpg',
    altDescription: 'Paella personalizada',
    photographerName: 'Chef Test',
    isFallback: false,
  };

  beforeEach(async () => {
    db = initDatabase({ inMemory: true });
    seedRecipes(db);
    app = await buildApp({ db, logger: false });
  });

  afterEach(async () => {
    await app.close();
    db.close();
  });

  it('PUT /api/v1/preferences/:recipeId persists custom candidate and GET retrieves it', async () => {
    const putRes = await app.inject({
      method: 'PUT',
      url: '/api/v1/preferences/rec-01-paella-marisco',
      payload: { candidate: validCandidate },
    });

    expect(putRes.statusCode).toBe(200);
    const saved = putRes.json();
    expect(saved.recipeId).toBe('rec-01-paella-marisco');
    expect(saved.imageId).toBe('cand-custom-1');

    const getRes = await app.inject({
      method: 'GET',
      url: '/api/v1/preferences/rec-01-paella-marisco',
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().imageId).toBe('cand-custom-1');

    const getAllRes = await app.inject({
      method: 'GET',
      url: '/api/v1/preferences',
    });
    expect(getAllRes.statusCode).toBe(200);
    expect(getAllRes.json()['rec-01-paella-marisco']).toBeDefined();
  });

  it('DELETE /api/v1/preferences/:recipeId resets preference to default', async () => {
    await app.inject({
      method: 'PUT',
      url: '/api/v1/preferences/rec-01-paella-marisco',
      payload: { candidate: validCandidate },
    });

    const delRes = await app.inject({
      method: 'DELETE',
      url: '/api/v1/preferences/rec-01-paella-marisco',
    });
    expect(delRes.statusCode).toBe(200);

    const getRes = await app.inject({
      method: 'GET',
      url: '/api/v1/preferences/rec-01-paella-marisco',
    });
    expect(getRes.statusCode).toBe(404);
  });

  it('PUT /api/v1/preferences/:recipeId returns 404 when recipeId does not exist', async () => {
    const putRes = await app.inject({
      method: 'PUT',
      url: '/api/v1/preferences/non-existent-recipe-xyz',
      payload: { candidate: validCandidate },
    });
    expect(putRes.statusCode).toBe(404);
  });
});
