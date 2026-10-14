import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '@backend/app';
import { initDatabase } from '@backend/database/sqlite';
import { seedRecipes } from '@backend/database/seeds/recipes.seed';
import Database from 'better-sqlite3';

describe('Planner & Shopping List API Contract Tests', () => {
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

  it('GET /api/v1/planner returns 7-day plan structure', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/planner',
    });

    expect(res.statusCode).toBe(200);
    const plan = res.json();
    expect(plan.lunes).toBeDefined();
    expect(plan.domingo).toBeDefined();
  });

  it('PUT /api/v1/planner updates meal slot and GET /api/v1/shopping-list computes ingredients', async () => {
    const updateRes = await app.inject({
      method: 'PUT',
      url: '/api/v1/planner/meal',
      payload: {
        day: 'lunes',
        slot: 'lunch',
        recipeId: 'rec-01-paella-marisco',
      },
    });

    expect(updateRes.statusCode).toBe(200);
    const updatedPlan = updateRes.json();
    expect(updatedPlan.lunes.lunch?.id).toBe('rec-01-paella-marisco');

    const shopRes = await app.inject({
      method: 'GET',
      url: '/api/v1/shopping-list',
    });

    expect(shopRes.statusCode).toBe(200);
    const shoppingList = shopRes.json();
    expect(shoppingList.items.length).toBeGreaterThan(0);
    expect(shoppingList.items.some((i: { name: string }) => i.name.toLowerCase().includes('arroz'))).toBe(true);
  });
});
