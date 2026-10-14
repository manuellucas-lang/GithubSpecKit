import { RecipeImageCandidate } from '@shared/models/recipe_image_candidate';

interface UnsplashPhotoItem {
  id: string;
  urls?: {
    regular?: string;
    small?: string;
    thumb?: string;
  };
  alt_description?: string;
  user?: {
    name?: string;
    links?: {
      html?: string;
    };
  };
}

const CURATED_CANDIDATES: Record<string, RecipeImageCandidate[]> = {
  'seafood paella': [
    {
      id: 'paella-1',
      keyword: 'seafood paella',
      url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1000&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=300&q=80',
      altDescription: 'Paella tradicional de marisco con langostinos y mejillones',
      photographerName: 'Eneko Uruñuela',
      photographerUrl: 'https://unsplash.com/@enekourunuela',
      isFallback: false,
    },
    {
      id: 'paella-2',
      keyword: 'seafood paella',
      url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=1000&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=300&q=80',
      altDescription: 'Paellera mediterránea al aire libre',
      photographerName: 'Annie Spratt',
      photographerUrl: 'https://unsplash.com/@anniespratt',
      isFallback: false,
    },
    {
      id: 'paella-3',
      keyword: 'seafood paella',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80',
      altDescription: 'Arroz en paella con azafrán y mariscos variados',
      photographerName: 'Chunli Ju',
      photographerUrl: 'https://unsplash.com/@chunliju',
      isFallback: false,
    },
    {
      id: 'paella-4',
      keyword: 'seafood paella',
      url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80',
      altDescription: 'Detalle de arroz con gambas y limón',
      photographerName: 'Danijela Prijovic',
      photographerUrl: 'https://unsplash.com/@danijela_p',
      isFallback: false,
    },
  ],
  'gazpacho': [
    {
      id: 'gazpacho-1',
      keyword: 'gazpacho',
      url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80',
      altDescription: 'Bol de gazpacho andaluz fresco con albahaca',
      photographerName: 'Monika Grabkowska',
      photographerUrl: 'https://unsplash.com/@moniqa',
      isFallback: false,
    },
    {
      id: 'gazpacho-2',
      keyword: 'gazpacho',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
      altDescription: 'Sopa fría de tomate servida con aceite de oliva',
      photographerName: 'Karly Gomez',
      photographerUrl: 'https://unsplash.com/@karlygomez',
      isFallback: false,
    },
    {
      id: 'gazpacho-3',
      keyword: 'gazpacho',
      url: 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=1000&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=300&q=80',
      altDescription: 'Gazpacho con picatoste y guarnición',
      photographerName: 'Calum Lewis',
      photographerUrl: 'https://unsplash.com/@calumlewis',
      isFallback: false,
    },
  ],
};

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createFallbackSvg(index: number, keyword: string): string {
  const palettes = [
    { bg: '#0f172a', accent: '#ea580c', text: '#f8fafc' },
    { bg: '#1e293b', accent: '#3b82f6', text: '#f8fafc' },
    { bg: '#1c1917', accent: '#10b981', text: '#f8fafc' },
    { bg: '#312e81', accent: '#ec4899', text: '#f8fafc' },
    { bg: '#064e3b', accent: '#f59e0b', text: '#f8fafc' },
    { bg: '#450a0a', accent: '#fb923c', text: '#f8fafc' },
  ];
  const p = palettes[index % palettes.length];
  const escapedKeyword = escapeXml(keyword);

  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${p.bg}"/>
    <circle cx="300" cy="180" r="100" fill="${p.accent}" opacity="0.15"/>
    <circle cx="300" cy="180" r="70" fill="none" stroke="${p.accent}" stroke-width="4" stroke-dasharray="8 6"/>
    <text x="300" y="190" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="${p.text}" text-anchor="middle">
      ${escapedKeyword}
    </text>
    <text x="300" y="320" font-family="system-ui, sans-serif" font-size="14" fill="${p.text}" opacity="0.75" text-anchor="middle">
      GourmetCraft Studio - Alternativa ${index + 1}
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
}

export class ImageProviderGateway {
  private cache: Map<string, { candidates: RecipeImageCandidate[]; timestamp: number }> = new Map();
  private readonly maxCacheEntries = 100;
  private readonly ttlMs = 24 * 60 * 60 * 1000; // 24 hours

  private setCache(key: string, candidates: RecipeImageCandidate[]): void {
    if (this.cache.size >= this.maxCacheEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { candidates, timestamp: Date.now() });
  }

  async fetchCandidates(keywordParam: string, countParam: number = 6): Promise<RecipeImageCandidate[]> {
    const keyword = keywordParam.toLowerCase().trim();
    if (!keyword) {
      return [];
    }

    const count = Math.min(Math.max(Number.isFinite(countParam) ? Math.floor(countParam) : 6, 3), 10);
    const cacheKey = `${keyword}:${count}`;

    // 1. Check in-memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.ttlMs) {
      return cached.candidates;
    }

    // 2. Check curated gallery
    const curated = CURATED_CANDIDATES[keyword];
    if (curated && curated.length > 0) {
      const candidates = curated.slice(0, count);
      this.setCache(cacheKey, candidates);
      return candidates;
    }

    // 3. Query remote Unsplash API if secret key exists
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (accessKey) {
      try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=${count}`, {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = (await res.json()) as { results?: unknown };
          if (Array.isArray(data.results) && data.results.length > 0) {
            const candidates: RecipeImageCandidate[] = [];
            data.results.forEach((rawItem: unknown, idx: number) => {
              if (!rawItem || typeof rawItem !== 'object') return;
              const item = rawItem as UnsplashPhotoItem;
              const url = item.urls?.regular || item.urls?.small;
              if (!url) return;
              candidates.push({
                id: item.id || `remote-${idx}`,
                keyword,
                url,
                thumbUrl: item.urls?.thumb || url,
                altDescription: item.alt_description || `Alternativa ${idx + 1} para ${keyword}`,
                photographerName: item.user?.name || 'Unsplash Contributor',
                photographerUrl: item.user?.links?.html,
                isFallback: false,
              });
            });

            if (candidates.length >= 3) {
              this.setCache(cacheKey, candidates);
              return candidates;
            }
            // If candidates.length < 3, fall through to fallback collection
          }
        }
      } catch {
        // Fallback on network or remote error
      }
    }

    // 4. Fallback SVG Collection
    const fallbacks: RecipeImageCandidate[] = [];
    for (let i = 0; i < count; i++) {
      const svg = createFallbackSvg(i, keyword);
      fallbacks.push({
        id: `fallback-${keyword}-${i}`,
        keyword,
        url: svg,
        thumbUrl: svg,
        altDescription: `Ilustración alternativa ${i + 1} para ${keyword}`,
        photographerName: 'GourmetCraft Studio',
        isFallback: true,
      });
    }

    this.cache.set(cacheKey, { candidates: fallbacks, timestamp: Date.now() });
    return fallbacks;
  }
}
