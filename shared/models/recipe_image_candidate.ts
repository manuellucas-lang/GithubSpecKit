/**
 * Represents a photo candidate fetched from an image provider to be displayed in a carousel.
 */
export interface RecipeImageCandidate {
  id: string;
  keyword: string;
  url: string;
  thumbUrl: string;
  altDescription: string;
  photographerName: string;
  photographerUrl?: string;
  isFallback: boolean;
}

/**
 * Validates a candidate image item against basic format rules.
 *
 * @param candidate - The recipe image candidate to validate.
 * @throws {Error} If id, keyword, url or thumbUrl is empty.
 */
export function validateRecipeImageCandidate(candidate: RecipeImageCandidate): void {
  if (!candidate.id || candidate.id.trim() === '') {
    throw new Error('Candidate id is required');
  }
  if (!candidate.keyword || candidate.keyword.trim() === '') {
    throw new Error('Candidate keyword is required');
  }
  if (!candidate.url || candidate.url.trim() === '') {
    throw new Error('Candidate url is required');
  }
  if (!candidate.thumbUrl || candidate.thumbUrl.trim() === '') {
    throw new Error('Candidate thumbUrl is required');
  }
}
