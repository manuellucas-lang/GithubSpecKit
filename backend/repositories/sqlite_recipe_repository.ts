import Database from 'better-sqlite3';
import { Recipe, RecipeStep } from '@shared/models/recipe';
import { AllergenCode } from '@shared/models/allergen';
import { createCookingTime } from '@shared/models/cooking_time';
import { Ingredient } from '@shared/models/ingredient';

export interface RecipeFilterOptions {
  search?: string;
  maxCookingMinutes?: number;
  difficulty?: string;
  tag?: string;
}

export class SQLiteRecipeRepository {
  constructor(private db: Database.Database) {}

  findAll(filters: RecipeFilterOptions = {}): Recipe[] {
    let sql = 'SELECT * FROM recipes WHERE 1=1';
    const params: Record<string, unknown> = {};

    if (filters.search && filters.search.trim() !== '') {
      sql += ' AND (LOWER(title) LIKE @search OR LOWER(description) LIKE @search OR LOWER(keyword) LIKE @search)';
      params.search = `%${filters.search.toLowerCase().trim()}%`;
    }

    if (filters.maxCookingMinutes && Number.isFinite(filters.maxCookingMinutes)) {
      sql += ' AND (prep_time_minutes + cook_time_minutes) <= @maxTime';
      params.maxTime = filters.maxCookingMinutes;
    }

    if (filters.difficulty && filters.difficulty.trim() !== '') {
      sql += ' AND difficulty = @difficulty';
      params.difficulty = filters.difficulty;
    }

    sql += ' ORDER BY title ASC';

    const rows = this.db.prepare(sql).all(params) as Array<Record<string, unknown>>;
    return rows.map(row => this.hydrateRecipe(row));
  }

  findById(id: string): Recipe | null {
    const row = this.db.prepare('SELECT * FROM recipes WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.hydrateRecipe(row);
  }

  private hydrateRecipe(row: Record<string, unknown>): Recipe {
    const id = row.id as string;
    const ingredientsRows = this.db.prepare('SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY id ASC').all(id) as Array<{
      id: number;
      name: string;
      quantity: number;
      unit: string;
      notes: string | null;
    }>;

    const ingredients: Ingredient[] = ingredientsRows.map(i => ({
      id: `ing-${i.id}`,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      notes: i.notes || undefined,
    }));

    let steps: RecipeStep[] = [];
    try {
      steps = JSON.parse(row.instructions_json as string || '[]');
    } catch {
      steps = [];
    }

    let allergens: AllergenCode[] = [];
    try {
      allergens = JSON.parse(row.allergens_json as string || '[]');
    } catch {
      allergens = [];
    }

    const prep = (row.prep_time_minutes as number) || 0;
    const cook = (row.cook_time_minutes as number) || 0;

    return {
      id,
      title: row.title as string,
      description: row.description as string,
      keyword: row.keyword as string,
      servings: (row.servings as number) || 4,
      difficulty: row.difficulty as Recipe['difficulty'],
      cookingTime: createCookingTime(prep, cook),
      ingredients,
      steps,
      allergens,
      image: row.image_url
        ? {
            keyword: row.keyword as string,
            imageUrl: row.image_url as string,
            thumbUrl: row.image_url as string,
            fetchStatus: 'SUCCESS',
          }
        : undefined,
    };
  }
}
