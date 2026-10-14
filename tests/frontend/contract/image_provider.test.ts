import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageProviderClient } from '@frontend/services/image_provider_client';
import { apiClient } from '@frontend/api/api_client';

describe('ImageProviderClient Contract Tests', () => {
  let client: ImageProviderClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new ImageProviderClient();
  });

  it('fetches candidate and returns first image when apiClient succeeds', async () => {
    vi.spyOn(apiClient, 'getImageCandidates').mockResolvedValueOnce([
      {
        id: 'img-1',
        keyword: 'seafood paella',
        url: 'https://images.unsplash.com/photo-1',
        thumbUrl: 'https://images.unsplash.com/photo-1-thumb',
        altDescription: 'Paella de marisco',
        photographerName: 'Eneko',
        photographerUrl: 'https://unsplash.com/@eneko',
        isFallback: false,
      },
    ]);

    const result = await client.fetchImageByKeyword({ keyword: 'seafood paella' });
    expect(result.keyword).toBe('seafood paella');
    expect(result.url).toBe('https://images.unsplash.com/photo-1');
    expect(result.isFallback).toBe(false);
    expect(result.photographerName).toBe('Eneko');
  });

  it('returns fallback visual when apiClient throws or has no match', async () => {
    vi.spyOn(apiClient, 'getImageCandidates').mockRejectedValueOnce(new Error('Network error'));

    const result = await client.fetchImageByKeyword({ keyword: 'unknown-dish-xyz' });
    expect(result.isFallback).toBe(true);
    expect(result.url).toContain('data:image/svg+xml');
    expect(result.altDescription).toContain('unknown-dish-xyz');
  });
});
