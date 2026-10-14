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
