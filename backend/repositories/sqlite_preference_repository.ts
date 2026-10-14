import Database from 'better-sqlite3';
import { RecipeImageCandidate } from '@shared/models/recipe_image_candidate';
import { RecipeImagePreference, validateRecipeImagePreference } from '@shared/models/recipe_image_preference';

export class SQLitePreferenceRepository {
  constructor(private db: Database.Database) {}

  getAll(): Record<string, RecipeImagePreference> {
    const rows = this.db.prepare('SELECT * FROM recipe_image_preferences').all() as Array<{
      recipe_id: string;
      image_id: string;
      url: string;
      thumb_url: string;
      alt_description: string;
      photographer_name: string;
      photographer_url: string | null;
      is_custom: number;
      updated_at: string;
    }>;

    const result: Record<string, RecipeImagePreference> = {};
    for (const r of rows) {
      result[r.recipe_id] = {
        recipeId: r.recipe_id,
        imageId: r.image_id,
        url: r.url,
        thumbUrl: r.thumb_url,
        altDescription: r.alt_description,
        photographerName: r.photographer_name,
        photographerUrl: r.photographer_url || undefined,
        isCustom: r.is_custom === 1,
        updatedAt: r.updated_at,
      };
    }
    return result;
  }

  get(recipeId: string): RecipeImagePreference | null {
    const row = this.db.prepare('SELECT * FROM recipe_image_preferences WHERE recipe_id = ?').get(recipeId) as
      | {
          recipe_id: string;
          image_id: string;
          url: string;
          thumb_url: string;
          alt_description: string;
          photographer_name: string;
          photographer_url: string | null;
          is_custom: number;
          updated_at: string;
        }
      | undefined;

    if (!row) return null;

    return {
      recipeId: row.recipe_id,
      imageId: row.image_id,
      url: row.url,
      thumbUrl: row.thumb_url,
      altDescription: row.alt_description,
      photographerName: row.photographer_name,
      photographerUrl: row.photographer_url || undefined,
      isCustom: row.is_custom === 1,
      updatedAt: row.updated_at,
    };
  }

  hasRecipe(recipeId: string): boolean {
    const row = this.db.prepare('SELECT 1 FROM recipes WHERE id = ?').get(recipeId);
    return !!row;
  }

  set(recipeId: string, candidate: RecipeImageCandidate): RecipeImagePreference {
    if (!this.hasRecipe(recipeId)) {
      throw new Error(`Recipe with id "${recipeId}" not found`);
    }

    const preference: RecipeImagePreference = {
      recipeId,
      imageId: candidate.id,
      url: candidate.url,
      thumbUrl: candidate.thumbUrl,
      altDescription: candidate.altDescription,
      photographerName: candidate.photographerName,
      photographerUrl: candidate.photographerUrl,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };

    validateRecipeImagePreference(preference);

    const stmt = this.db.prepare(`
      INSERT INTO recipe_image_preferences (
        recipe_id, image_id, url, thumb_url, alt_description,
        photographer_name, photographer_url, is_custom, updated_at
      ) VALUES (
        @recipeId, @imageId, @url, @thumbUrl, @altDescription,
        @photographerName, @photographerUrl, 1, @updatedAt
      )
      ON CONFLICT(recipe_id) DO UPDATE SET
        image_id = excluded.image_id,
        url = excluded.url,
        thumb_url = excluded.thumb_url,
        alt_description = excluded.alt_description,
        photographer_name = excluded.photographer_name,
        photographer_url = excluded.photographer_url,
        is_custom = 1,
        updated_at = excluded.updated_at
    `);

    stmt.run({
      recipeId: preference.recipeId,
      imageId: preference.imageId,
      url: preference.url,
      thumbUrl: preference.thumbUrl,
      altDescription: preference.altDescription,
      photographerName: preference.photographerName,
      photographerUrl: preference.photographerUrl || null,
      updatedAt: preference.updatedAt,
    });

    return preference;
  }

  delete(recipeId: string): boolean {
    const res = this.db.prepare('DELETE FROM recipe_image_preferences WHERE recipe_id = ?').run(recipeId);
    return res.changes > 0;
  }
}
