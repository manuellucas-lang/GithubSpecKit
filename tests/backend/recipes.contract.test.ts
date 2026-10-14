import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '@backend/app';
import { initDatabase } from '@backend/database/sqlite';
import { seedRecipes } from '@backend/database/seeds/recipes.seed';
import Database from 'better-sqlite3';

describe('Recipes & Health API Contract Tests', () => {
  let app: FastifyInstance;
  let db: Database.Database;

  beforeEach(async () => {
    db = initDatabase({ inMemory: true });
    seedRecipes(db);
    app = await buildApp({ db, logger: false });
  });

  afterEach(async () => {
    await app.close();
    db.close();
  });

  it('GET /api/v1/health returns status 200 with service health info', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('recipe-catalog-api');
    expect(body.timestamp).toBeDefined();
  });

  it('GET /api/v1/recipes returns full list of catalog recipes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recipes',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.total).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('title');
    expect(body.data[0]).toHaveProperty('cookingTime');
    expect(body.data[0]).toHaveProperty('ingredients');
  });

  it('GET /api/v1/recipes?search=paella filters recipes by title or description', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recipes?search=paella',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].title.toLowerCase()).toContain('paella');
  });

  it('GET /api/v1/recipes?maxCookingMinutes=20 filters recipes by total duration', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recipes?maxCookingMinutes=20',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.length).toBeGreaterThan(0);
    body.data.forEach((r: { cookingTime: { totalMinutes: number } }) => {
      expect(r.cookingTime.totalMinutes).toBeLessThanOrEqual(20);
    });
  });

  it('GET /api/v1/recipes/:id returns recipe details or 404', async () => {
    const resValid = await app.inject({
      method: 'GET',
      url: '/api/v1/recipes/rec-01-paella-marisco',
    });
    expect(resValid.statusCode).toBe(200);
    const recipe = resValid.json();
    expect(recipe.id).toBe('rec-01-paella-marisco');
    expect(recipe.ingredients.length).toBeGreaterThan(0);

    const resNotFound = await app.inject({
      method: 'GET',
      url: '/api/v1/recipes/non-existent-id',
    });
    expect(resNotFound.statusCode).toBe(404);
  });
});
