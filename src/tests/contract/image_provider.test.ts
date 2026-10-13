import { describe, it, expect, beforeEach } from 'vitest';
import { ImageProviderClient } from '../../infrastructure/api/image_provider_client';
import { imageCache } from '../../infrastructure/cache/image_cache';

describe('ImageProviderClient Contract Tests', () => {
  let client: ImageProviderClient;

  beforeEach(() => {
    imageCache.clear();
    client = new ImageProviderClient();
  });

  it('fetches curated image by keyword correctly', async () => {
    const result = await client.fetchImageByKeyword({ keyword: 'seafood paella' });
    expect(result.keyword).toBe('seafood paella');
    expect(result.url).toContain('https://images.unsplash.com');
    expect(result.isFallback).toBe(false);
    expect(result.photographerName).toBe('Chrissie Kremer');
  });

  it('caches image lookup and returns cached result on subsequent calls', async () => {
    const first = await client.fetchImageByKeyword({ keyword: 'gazpacho' });
    const cached = imageCache.get('gazpacho');
    expect(cached).not.toBeNull();
    expect(cached?.url).toBe(first.url);

    const second = await client.fetchImageByKeyword({ keyword: 'gazpacho' });
    expect(second.url).toBe(first.url);
  });

  it('returns fallback visual when an unknown keyword fails remote lookup', async () => {
    const result = await client.fetchImageByKeyword({ keyword: 'unknown-dish-xyz-non-existent' });
    expect(result.isFallback).toBe(true);
    expect(result.url).toContain('data:image/svg+xml');
    expect(result.altDescription).toContain('unknown-dish-xyz-non-existent');
  });
});
