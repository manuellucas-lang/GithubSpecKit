import { describe, it, expect, beforeEach } from 'vitest';
import { ImageProviderClient } from '../../infrastructure/api/image_provider_client';
import { imageCache } from '../../infrastructure/cache/image_cache';

describe('ImageProviderClient Candidates Contract Tests', () => {
  let client: ImageProviderClient;

  beforeEach(() => {
    imageCache.clear();
    client = new ImageProviderClient();
  });

  it('fetches multiple curated image candidates for known keywords', async () => {
    const candidates = await client.fetchImageCandidatesByKeyword({ keyword: 'seafood paella', count: 4 });
    expect(candidates).toBeInstanceOf(Array);
    expect(candidates.length).toBeGreaterThanOrEqual(3);

    const first = candidates[0];
    expect(first.id).toBeDefined();
    expect(first.url).toContain('http');
    expect(first.thumbUrl).toBeDefined();
    expect(first.photographerName).toBeDefined();
    expect(first.isFallback).toBe(false);
  });

  it('provides diverse candidate image IDs and URLs for the same keyword', async () => {
    const candidates = await client.fetchImageCandidatesByKeyword({ keyword: 'gazpacho', count: 4 });
    const urls = new Set(candidates.map(c => c.url));
    expect(urls.size).toBe(candidates.length);
  });

  it('returns fallback candidate collection gracefully when remote fails or keyword has no match', async () => {
    const candidates = await client.fetchImageCandidatesByKeyword({
      keyword: 'unknown-dish-xyz-unmatched',
      count: 4,
    });
    expect(candidates).toBeInstanceOf(Array);
    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(candidates[0].isFallback).toBe(true);
    expect(candidates[0].url).toContain('data:image/svg+xml');
  });

  it('escapes XML special characters in fallback SVG and percent-encodes data URI', async () => {
    const candidates = await client.fetchImageCandidatesByKeyword({
      keyword: 'fish & chips <gourmet>',
      count: 2,
    });
    const url = candidates[0].url;
    expect(url).toContain('data:image/svg+xml;charset=utf-8,');
    const decoded = decodeURIComponent(url.replace('data:image/svg+xml;charset=utf-8,', ''));
    expect(decoded).toContain('&amp;');
    expect(decoded).toContain('&lt;');
    expect(decoded).toContain('&gt;');
    expect(decoded).not.toContain('<gourmet>');
  });
});

