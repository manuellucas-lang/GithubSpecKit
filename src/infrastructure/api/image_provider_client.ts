import { imageCache } from '../cache/image_cache';
import { RecipeImageCandidate } from '../../domain/models/recipe_image_candidate';

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

interface CuratedPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl?: string;
  alt: string;
}

// Curated high-resolution photo galleries for known recipes
const CURATED_CANDIDATE_GALLERIES: Record<string, CuratedPhoto[]> = {
  'seafood paella': [
    {
      id: 'paella-1',
      url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=400&q=80',
      photographer: 'Chrissie Kremer',
      alt: 'Paella de marisco tradicional en sartén de hierro',
    },
    {
      id: 'paella-2',
      url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=400&q=80',
      photographer: 'Annie Spratt',
      alt: 'Paella valenciana con gambas y mejillones',
    },
    {
      id: 'paella-3',
      url: 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=400&q=80',
      photographer: 'Fidel Fernando',
      alt: 'Detalle de arroz a banda con cigalas y limón',
    },
    {
      id: 'paella-4',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
      photographer: 'Dana DeVolk',
      alt: 'Paella de marisco servida al aire libre',
    },
  ],
  'gazpacho': [
    {
      id: 'gazpacho-1',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      photographer: 'Vitalii Pavlyshynets',
      alt: 'Gazpacho andaluz servido en cuenco con guarnición fresca',
    },
    {
      id: 'gazpacho-2',
      url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=400&q=80',
      photographer: 'Calum Lewis',
      alt: 'Sopa fría de tomate con aceite de oliva virgen extra',
    },
    {
      id: 'gazpacho-3',
      url: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=400&q=80',
      photographer: 'Karyna Panchenko',
      alt: 'Gazpacho artesanal en vaso con albahaca',
    },
    {
      id: 'gazpacho-4',
      url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
      photographer: 'Eiliv Aceron',
      alt: 'Crema fría de hortalizas de huerta mediterránea',
    },
  ],
  'mushroom risotto': [
    {
      id: 'risotto-1',
      url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=400&q=80',
      photographer: 'Monika Grabkowska',
      alt: 'Risotto cremoso de setas boletus y parmesano',
    },
    {
      id: 'risotto-2',
      url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=400&q=80',
      photographer: 'Engin Akyurt',
      alt: 'Plato hondo de risotto con trufa y hierbas finas',
    },
    {
      id: 'risotto-3',
      url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?auto=format&fit=crop&w=400&q=80',
      photographer: 'Alisa Anton',
      alt: 'Risotto al funghi porcini recién emplatado',
    },
  ],
  'baked salmon asparagus': [
    {
      id: 'salmon-1',
      url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
      photographer: 'Casey Lee',
      alt: 'Salmón al horno con espárragos verdes y limón',
    },
    {
      id: 'salmon-2',
      url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',
      photographer: 'Sebastian Coman',
      alt: 'Filete de salmón dorado con guarnición de verduras',
    },
    {
      id: 'salmon-3',
      url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=400&q=80',
      photographer: 'Caroline Attwood',
      alt: 'Salmón fresco glaseado a la plancha',
    },
  ],
  'quinoa avocado bowl': [
    {
      id: 'quinoa-1',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      photographer: 'Anna Pelzer',
      alt: 'Bowl saludable de quinoa, aguacate y verduras frescas',
    },
    {
      id: 'quinoa-2',
      url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      photographer: 'Roop Vandepol',
      alt: 'Ensalada multicolor con quinoa y aguacate maduro',
    },
    {
      id: 'quinoa-3',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      photographer: 'Vitalii Pavlyshynets',
      alt: 'Buddha bowl con semillas y aderezo cítrico',
    },
  ],
  'chocolate hazelnut brownie': [
    {
      id: 'brownie-1',
      url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
      photographer: 'Food Photographer Jacek',
      alt: 'Brownie de chocolate negro y avellanas tostadas',
    },
    {
      id: 'brownie-2',
      url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80',
      photographer: 'Jonas Kakaroto',
      alt: 'Porción jugosa de brownie artesanal con nueces',
    },
    {
      id: 'brownie-3',
      url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
      photographer: 'Mae Mu',
      alt: 'Pastel de chocolate templado con textura fundente',
    },
  ],
};

const DEFAULT_FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%231e293b"/><path d="M400 230c-55 0-100 45-100 100 0 60 70 120 100 140 30-20 100-80 100-140 0-55-45-100-100-100z" fill="%23ea580c" opacity="0.3"/><text x="400" y="320" font-family="system-ui" font-size="28" font-weight="bold" fill="%23f8fafc" text-anchor="middle">Plato Gourmet</text><text x="400" y="360" font-family="system-ui" font-size="16" fill="%2394a3b8" text-anchor="middle">Imagen gastronómica en preparación</text></svg>';

function createFallbackSvg(index: number, keyword: string): string {
  const hues = ['%23ea580c', '%233b82f6', '%2310b981', '%238b5cf6'];
  const fill = hues[index % hues.length];
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%231e293b"/><circle cx="400" cy="280" r="90" fill="${fill}" opacity="0.25"/><text x="400" y="300" font-family="system-ui" font-size="24" font-weight="bold" fill="%23f8fafc" text-anchor="middle">Opción Culinaria ${index + 1}</text><text x="400" y="340" font-family="system-ui" font-size="14" fill="%2394a3b8" text-anchor="middle">${keyword}</text></svg>`;
}

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
    const curatedList = CURATED_CANDIDATE_GALLERIES[keyword];
    if (curatedList && curatedList.length > 0) {
      const first = curatedList[0];
      const result: ImageQueryResult = {
        keyword,
        url: first.url,
        thumbUrl: first.thumbUrl,
        altDescription: first.alt,
        photographerName: first.photographer,
        photographerUrl: 'https://unsplash.com',
        isFallback: false,
      };
      imageCache.set(keyword, result);
      return result;
    }

    // Try remote source if available
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1`, {
        headers: {
          Accept: 'application/json',
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
      // Fallback
    }

    return {
      keyword,
      url: DEFAULT_FALLBACK_SVG,
      thumbUrl: DEFAULT_FALLBACK_SVG,
      altDescription: `Imagen gastronómica de referencia para ${keyword}`,
      photographerName: 'GourmetCraft Visual Studio',
      isFallback: true,
    };
  }

  async fetchImageCandidatesByKeyword(options: ImageCandidatesQueryOptions): Promise<RecipeImageCandidate[]> {
    const keyword = options.keyword.toLowerCase().trim();
    const count = options.count && options.count > 0 ? options.count : 4;

    // Check curated library first
    const curated = CURATED_CANDIDATE_GALLERIES[keyword];
    if (curated && curated.length > 0) {
      return curated.slice(0, count).map(p => ({
        id: p.id,
        keyword,
        url: p.url,
        thumbUrl: p.thumbUrl,
        altDescription: p.alt,
        photographerName: p.photographer,
        photographerUrl: p.photographerUrl || 'https://unsplash.com',
        isFallback: false,
      }));
    }

    // Try remote API query for candidates
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=${count}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((item: any, idx: number) => ({
            id: item.id || `remote-${idx}`,
            keyword,
            url: item.urls.regular || item.urls.small,
            thumbUrl: item.urls.thumb || item.urls.small,
            altDescription: item.alt_description || `Alternativa ${idx + 1} para ${keyword}`,
            photographerName: item.user?.name || 'Unsplash Contributor',
            photographerUrl: item.user?.links?.html,
            isFallback: false,
          }));
        }
      }
    } catch {
      // Remote lookup failed: gracefully build fallback candidate suite
    }

    // Fallback collection
    const fallbacks: RecipeImageCandidate[] = [];
    for (let i = 0; i < count; i++) {
      const svg = createFallbackSvg(i, keyword);
      fallbacks.push({
        id: `fallback-${keyword}-${i}`,
        keyword,
        url: svg,
        thumbUrl: svg,
        altDescription: `Ilustración gastronómica alternativa ${i + 1} para ${keyword}`,
        photographerName: 'GourmetCraft Studio',
        isFallback: true,
      });
    }

    return fallbacks;
  }
}

export const imageProviderClient = new ImageProviderClient();
