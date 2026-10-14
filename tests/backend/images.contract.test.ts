import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '@backend/app';
import { initDatabase } from '@backend/database/sqlite';
import Database from 'better-sqlite3';

describe('Images Proxy API Contract Tests', () => {
  let app: FastifyInstance;
  let db: Database.Database;

  beforeEach(async () => {
    db = initDatabase({ inMemory: true });
    app = await buildApp({ db, logger: false });
  });

  afterEach(async () => {
    await app.close();
    db.close();
  });

  it('GET /api/v1/images/candidates returns at least 3 candidates for known keywords', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/images/candidates?keyword=seafood+paella&count=4',
    });

    expect(res.statusCode).toBe(200);
    const candidates = res.json();
    expect(candidates).toBeInstanceOf(Array);
    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(candidates[0]).toHaveProperty('id');
    expect(candidates[0]).toHaveProperty('url');
    expect(candidates[0]).toHaveProperty('thumbUrl');
  });

  it('GET /api/v1/images/candidates returns SVG fallback candidates when query is unmatched', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/images/candidates?keyword=non-existent-dish-xyz&count=3',
    });

    expect(res.statusCode).toBe(200);
    const candidates = res.json();
    expect(candidates).toBeInstanceOf(Array);
    expect(candidates.length).toBe(3);
    expect(candidates[0].isFallback).toBe(true);
    expect(candidates[0].url).toContain('data:image/svg+xml');
  });

  it('GET /api/v1/images/candidates rejects empty keyword with 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/images/candidates?keyword=',
    });

    expect(res.statusCode).toBe(400);
  });
});
