import Database from 'better-sqlite3';
import { WeeklyPlan, DayOfWeek, MealSlot, createEmptyWeeklyPlan } from '@shared/models/weekly_plan';
import { SQLiteRecipeRepository } from './sqlite_recipe_repository';

export class SQLitePlannerRepository {
  private recipeRepo: SQLiteRecipeRepository;

  constructor(private db: Database.Database) {
    this.recipeRepo = new SQLiteRecipeRepository(db);
  }

  getPlan(weekId: string = 'current'): WeeklyPlan {
    const plan = createEmptyWeeklyPlan();

    const rows = this.db.prepare('SELECT day_of_week, meal_type, recipe_id FROM planned_meals WHERE week_id = ?').all(weekId) as Array<{
      day_of_week: DayOfWeek;
      meal_type: MealSlot;
      recipe_id: string;
    }>;

    for (const row of rows) {
      const recipe = this.recipeRepo.findById(row.recipe_id);
      if (plan[row.day_of_week]) {
        plan[row.day_of_week][row.meal_type] = recipe;
      }
    }

    return plan;
  }

  hasRecipe(recipeId: string): boolean {
    const row = this.db.prepare('SELECT 1 FROM recipes WHERE id = ?').get(recipeId);
    return !!row;
  }

  setMeal(day: DayOfWeek, slot: MealSlot, recipeId: string | null, weekId: string = 'current'): WeeklyPlan {
    if (recipeId && !this.hasRecipe(recipeId)) {
      throw new Error(`Recipe with id "${recipeId}" not found`);
    }

    const tx = this.db.transaction(() => {
      this.db.prepare('INSERT OR IGNORE INTO weekly_plans (week_id, updated_at) VALUES (?, ?)').run(weekId, new Date().toISOString());

      if (!recipeId) {
        this.db.prepare('DELETE FROM planned_meals WHERE week_id = ? AND day_of_week = ? AND meal_type = ?').run(weekId, day, slot);
      } else {
        const stmt = this.db.prepare(`
          INSERT INTO planned_meals (week_id, day_of_week, meal_type, recipe_id, servings)
          VALUES (@weekId, @day, @slot, @recipeId, 2)
          ON CONFLICT(week_id, day_of_week, meal_type) DO UPDATE SET
            recipe_id = excluded.recipe_id
        `);
        stmt.run({ weekId, day, slot, recipeId });
      }

      this.db.prepare('UPDATE weekly_plans SET updated_at = ? WHERE week_id = ?').run(new Date().toISOString(), weekId);
    });

    tx();

    return this.getPlan(weekId);
  }

  clearPlan(weekId: string = 'current'): WeeklyPlan {
    this.db.prepare('DELETE FROM planned_meals WHERE week_id = ?').run(weekId);
    return createEmptyWeeklyPlan();
  }
}
