export interface CachedImageData {
  keyword: string;
  url: string;
  thumbUrl: string;
  altDescription: string;
  photographerName: string;
  photographerUrl?: string;
  timestamp: number;
}

const CACHE_PREFIX = 'recipe_img_cache_';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export class ImageCache {
  private memoryMap = new Map<string, CachedImageData>();

  get(keyword: string): CachedImageData | null {
    const key = keyword.toLowerCase().trim();
    if (this.memoryMap.has(key)) {
      return this.memoryMap.get(key)!;
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = window.sessionStorage.getItem(CACHE_PREFIX + key);
        if (raw) {
          const parsed = JSON.parse(raw) as CachedImageData;
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            this.memoryMap.set(key, parsed);
            return parsed;
          }
        }
      }
    } catch {
      // Ignore storage errors in test or restricted environments
    }

    return null;
  }

  set(keyword: string, data: Omit<CachedImageData, 'timestamp'>): void {
    const key = keyword.toLowerCase().trim();
    const entry: CachedImageData = { ...data, timestamp: Date.now() };
    this.memoryMap.set(key, entry);

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
      }
    } catch {
      // Ignore storage quota or restriction errors
    }
  }

  clear(): void {
    this.memoryMap.clear();
  }
}

export const imageCache = new ImageCache();
