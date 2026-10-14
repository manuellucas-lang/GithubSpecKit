import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageProviderClient } from '@frontend/services/image_provider_client';
import { apiClient } from '@frontend/api/api_client';

describe('ImageProviderClient Candidates Contract Tests', () => {
  let client: ImageProviderClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new ImageProviderClient();
  });

  it('fetches candidate list via apiClient for known keywords', async () => {
    const mockCandidates = [
      {
        id: 'paella-1',
        keyword: 'seafood paella',
        url: 'https://images.unsplash.com/paella-1',
        thumbUrl: 'https://images.unsplash.com/paella-1-thumb',
        altDescription: 'Paella 1',
        photographerName: 'Photographer 1',
        isFallback: false,
      },
      {
        id: 'paella-2',
        keyword: 'seafood paella',
        url: 'https://images.unsplash.com/paella-2',
        thumbUrl: 'https://images.unsplash.com/paella-2-thumb',
        altDescription: 'Paella 2',
        photographerName: 'Photographer 2',
        isFallback: false,
      },
      {
        id: 'paella-3',
        keyword: 'seafood paella',
        url: 'https://images.unsplash.com/paella-3',
        thumbUrl: 'https://images.unsplash.com/paella-3-thumb',
        altDescription: 'Paella 3',
        photographerName: 'Photographer 3',
        isFallback: false,
      },
    ];

    vi.spyOn(apiClient, 'getImageCandidates').mockResolvedValueOnce(mockCandidates);

    const candidates = await client.fetchImageCandidatesByKeyword({ keyword: 'seafood paella', count: 4 });
    expect(candidates).toHaveLength(3);
    expect(candidates[0].id).toBe('paella-1');
    expect(candidates[0].isFallback).toBe(false);
  });

  it('returns fallback candidate collection gracefully when apiClient fails', async () => {
    vi.spyOn(apiClient, 'getImageCandidates').mockRejectedValueOnce(new Error('Connection refused'));

    const candidates = await client.fetchImageCandidatesByKeyword({
      keyword: 'gazpacho',
      count: 4,
    });

    expect(candidates).toHaveLength(4);
    expect(candidates[0].isFallback).toBe(true);
    expect(candidates[0].url).toContain('data:image/svg+xml');
  });

  it('escapes special characters in fallback SVG', async () => {
    vi.spyOn(apiClient, 'getImageCandidates').mockRejectedValueOnce(new Error('Network error'));

    const candidates = await client.fetchImageCandidatesByKeyword({
      keyword: 'fish & chips <gourmet>',
      count: 3,
    });

    const url = candidates[0].url;
    expect(url).toContain('data:image/svg+xml;utf8,');
    expect(candidates).toHaveLength(3);
  });

  it('normalizes count parameter to be between 3 and 10 with default 6', async () => {
    vi.spyOn(apiClient, 'getImageCandidates').mockRejectedValue(new Error('Force fallback'));

    const belowMin = await client.fetchImageCandidatesByKeyword({
      keyword: 'unknown-dish',
      count: 2,
    });
    expect(belowMin).toHaveLength(3);

    const aboveMax = await client.fetchImageCandidatesByKeyword({
      keyword: 'unknown-dish',
      count: 15,
    });
    expect(aboveMax).toHaveLength(10);

    const defaultCount = await client.fetchImageCandidatesByKeyword({
      keyword: 'unknown-dish',
    });
    expect(defaultCount).toHaveLength(6);
  });
});
