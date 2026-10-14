import { RecipeImageCandidate } from '@shared/models/recipe_image_candidate';
import { apiClient } from '../api/api_client';

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

export interface ImageCandidatesQueryOptions {
  keyword: string;
  count?: number;
  orientation?: 'landscape' | 'squarish';
}

function generateSvgFallback(title: string): string {
  const cleanTitle = title.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="400" cy="250" r="70" fill="#ea580c" opacity="0.2"/>
    <path d="M370 240 Q400 210 430 240 T430 270 Q400 300 370 270 Z" fill="#ea580c"/>
    <text x="50%" y="380" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#f8fafc" text-anchor="middle">${cleanTitle}</text>
    <text x="50%" y="420" font-family="system-ui, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">GourmetCraft Culinary Image</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export class ImageProviderClient {
  async fetchImageCandidatesByKeyword(options: ImageCandidatesQueryOptions): Promise<RecipeImageCandidate[]> {
    const keyword = (options.keyword || 'culinary').trim().toLowerCase();
    const count = Math.max(3, Math.min(10, options.count || 6));

    try {
      const candidates = await apiClient.getImageCandidates(keyword, count);
      if (Array.isArray(candidates) && candidates.length > 0) {
        return candidates;
      }
    } catch {
      // Backend error or network error, generate fallback
    }

    const fallbackUrl = generateSvgFallback(keyword);
    return Array.from({ length: count }, (_, idx) => ({
      id: `fallback-${keyword}-${idx + 1}`,
      keyword,
      url: fallbackUrl,
      thumbUrl: fallbackUrl,
      altDescription: `Ilustracion culinaria para ${keyword} (${idx + 1})`,
      photographerName: 'GourmetCraft Design System',
      isFallback: true,
    }));
  }

  async fetchImageByKeyword(options: ImageQueryOptions): Promise<ImageQueryResult> {
    const candidates = await this.fetchImageCandidatesByKeyword({
      keyword: options.keyword,
      count: 3,
    });

    const first = candidates[0];
    if (first) {
      return {
        keyword: first.keyword,
        url: first.url,
        thumbUrl: first.thumbUrl,
        altDescription: first.altDescription,
        photographerName: first.photographerName,
        photographerUrl: first.photographerUrl,
        isFallback: first.isFallback,
      };
    }

    const fallback = generateSvgFallback(options.keyword);
    return {
      keyword: options.keyword,
      url: fallback,
      thumbUrl: fallback,
      altDescription: `Ilustracion culinaria para ${options.keyword}`,
      photographerName: 'GourmetCraft Design System',
      isFallback: true,
    };
  }
}

export const imageProviderClient = new ImageProviderClient();
