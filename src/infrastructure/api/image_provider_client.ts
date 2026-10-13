import { imageCache } from '../cache/image_cache';

export interface ImageQueryOptions {
  keyword: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  quality?: 'regular' | 'thumb' | 'high';
}

export interface ImageQueryResult {
  keyword: string;
  url: string;
  thumbUrl: string;
  altDescription: string;
  photographerName: string;
  photographerUrl?: string;
  isFallback: boolean;
}

// Curated high-resolution fallback photos for known recipes to ensure instant, reliable loading
const CURATED_CULINARY_PHOTOS: Record<string, { url: string; thumbUrl: string; photographer: string }> = {
  'seafood paella': {
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=400&q=80',
    photographer: 'Chrissie Kremer',
  },
  'gazpacho': {
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    photographer: 'Vitalii Pavlyshynets',
  },
  'mushroom risotto': {
    url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=400&q=80',
    photographer: 'Monika Grabkowska',
  },
  'baked salmon asparagus': {
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
    photographer: 'Casey Lee',
  },
  'quinoa avocado bowl': {
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    photographer: 'Anna Pelzer',
  },
  'chocolate hazelnut brownie': {
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
    photographer: 'Food Photographer Jacek',
  },
};

const DEFAULT_FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%231e293b"/><path d="M400 230c-55 0-100 45-100 100 0 60 70 120 100 140 30-20 100-80 100-140 0-55-45-100-100-100z" fill="%23ea580c" opacity="0.3"/><text x="400" y="320" font-family="system-ui" font-size="28" font-weight="bold" fill="%23f8fafc" text-anchor="middle">Plato Gourmet</text><text x="400" y="360" font-family="system-ui" font-size="16" fill="%2394a3b8" text-anchor="middle">Imagen gastronómica en preparación</text></svg>';

export class ImageProviderClient {
  async fetchImageByKeyword(options: ImageQueryOptions): Promise<ImageQueryResult> {
    const keyword = options.keyword.toLowerCase().trim();

    // Check cache
    const cached = imageCache.get(keyword);
    if (cached) {
      return {
        keyword,
        url: cached.url,
        thumbUrl: cached.thumbUrl,
        altDescription: cached.altDescription,
        photographerName: cached.photographerName,
        photographerUrl: cached.photographerUrl,
        isFallback: false,
      };
    }

    // Check curated library for known culinary keywords
    const curated = CURATED_CULINARY_PHOTOS[keyword];
    if (curated) {
      const result: ImageQueryResult = {
        keyword,
        url: curated.url,
        thumbUrl: curated.thumbUrl,
        altDescription: `Fotografía gastronómica de ${keyword}`,
        photographerName: curated.photographer,
        photographerUrl: `https://unsplash.com`,
        isFallback: false,
      };
      imageCache.set(keyword, result);
      return result;
    }

    // Try remote source if available
    try {
      // Source API lookup with keyword
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const item = data.results[0];
          const result: ImageQueryResult = {
            keyword,
            url: item.urls.regular || item.urls.small,
            thumbUrl: item.urls.thumb || item.urls.small,
            altDescription: item.alt_description || `Receta de ${keyword}`,
            photographerName: item.user?.name || 'Unsplash Contributor',
            photographerUrl: item.user?.links?.html,
            isFallback: false,
          };
          imageCache.set(keyword, result);
          return result;
        }
      }
    } catch {
      // Network or quota error: fall back smoothly
    }

    // Fallback strategy
    return {
      keyword,
      url: DEFAULT_FALLBACK_SVG,
      thumbUrl: DEFAULT_FALLBACK_SVG,
      altDescription: `Imagen gastronómica de referencia para ${keyword}`,
      photographerName: 'GourmetCraft Visual Studio',
      isFallback: true,
    };
  }
}

export const imageProviderClient = new ImageProviderClient();
