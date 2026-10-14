/**
 * Represents a candidate image option for a recipe retrieved from a provider.
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
 * Validates a recipe image candidate entity against integrity and constraint rules.
 *
 * @param candidate - The image candidate object to validate.
 * @throws {Error} If candidate id, url, alt description, or photographer name is invalid or missing.
 */
export function validateRecipeImageCandidate(candidate: RecipeImageCandidate): void {
  if (!candidate.id || candidate.id.trim() === '') {
    throw new Error('Candidate image id is required');
  }
  if (!candidate.url || candidate.url.trim() === '') {
    throw new Error('Candidate image url is required');
  }
  if (!candidate.altDescription || candidate.altDescription.trim().length < 3) {
    throw new Error('Candidate alt description must have at least 3 characters');
  }
  if (!candidate.photographerName || candidate.photographerName.trim() === '') {
    throw new Error('Candidate photographer name is required');
  }
}

