import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Recipe } from '@shared/models/recipe';

/**
 * Seeds initial recipe catalog data into SQLite database if empty.
 *
 * @param db - The SQLite database instance.
 */
export function seedRecipes(db: Database.Database): void {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
  if (countRow.count > 0) {
    return; // Already seeded
  }

  let seedPath = '';
  try {
    seedPath = fileURLToPath(new URL('./recipes.json', import.meta.url));
  } catch {
    // Vitest/browser context where import.meta.url is not a file URL
  }

  if (!seedPath || !fs.existsSync(seedPath)) {
    const cwdCandidate = path.resolve(process.cwd(), 'backend/database/seeds/recipes.json');
    if (fs.existsSync(cwdCandidate)) {
      seedPath = cwdCandidate;
    }
  }

  if (!seedPath || !fs.existsSync(seedPath)) {
    return;
  }

  const rawData = fs.readFileSync(seedPath, 'utf-8');
  const recipes = JSON.parse(rawData) as Recipe[];

  const insertRecipe = db.prepare(`
    INSERT INTO recipes (
      id, title, description, keyword, prep_time_minutes, cook_time_minutes,
      servings, difficulty, cuisine, image_url, instructions_json, allergens_json
    ) VALUES (
      @id, @title, @description, @keyword, @prepMinutes, @cookMinutes,
      @servings, @difficulty, @cuisine, @imageUrl, @instructionsJson, @allergensJson
    )
  `);

  const insertIngredient = db.prepare(`
    INSERT INTO ingredients (recipe_id, name, quantity, unit, notes)
    VALUES (@recipeId, @name, @quantity, @unit, @notes)
  `);

  const insertTag = db.prepare(`
    INSERT OR IGNORE INTO recipe_tags (recipe_id, tag)
    VALUES (@recipeId, @tag)
  `);

  const seedTransaction = db.transaction((catalog: Recipe[]) => {
    for (const r of catalog) {
      insertRecipe.run({
        id: r.id,
        title: r.title,
        description: r.description,
        keyword: r.keyword,
        prepMinutes: r.cookingTime.prepMinutes,
        cookMinutes: r.cookingTime.cookMinutes,
        servings: r.servings,
        difficulty: r.difficulty,
        cuisine: 'Española',
        imageUrl: r.image?.imageUrl || null,
        instructionsJson: JSON.stringify(r.steps || []),
        allergensJson: JSON.stringify(r.allergens || []),
      });

      if (Array.isArray(r.ingredients)) {
        for (const ing of r.ingredients) {
          insertIngredient.run({
            recipeId: r.id,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes || null,
          });
        }
      }

      insertTag.run({ recipeId: r.id, tag: r.difficulty.toLowerCase() });
      insertTag.run({ recipeId: r.id, tag: r.keyword.toLowerCase() });
    }
  });

  seedTransaction(recipes);
}
