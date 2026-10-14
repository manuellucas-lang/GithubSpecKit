import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface DatabaseConfig {
  filename?: string;
  inMemory?: boolean;
}

/**
 * Initializes and configures a SQLite database connection with ACID WAL pragmas
 * and runs automatic DDL schema migrations.
 *
 * @param config - Database configuration options.
 * @returns Initialized better-sqlite3 Database instance.
 */
export function initDatabase(config: DatabaseConfig = {}): Database.Database {
  let db: Database.Database;

  if (config.inMemory) {
    db = new Database(':memory:');
  } else {
    const dbPath = config.filename || path.resolve(process.cwd(), 'data', 'recipes.db');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(dbPath);
  }

  // Performance & Integrity Pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  runMigrations(db);

  return db;
}

/**
 * Executes DDL table definitions and indexes if they do not exist.
 *
 * @param db - The SQLite database instance.
 */
export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      keyword TEXT NOT NULL,
      prep_time_minutes INTEGER NOT NULL,
      cook_time_minutes INTEGER NOT NULL,
      servings INTEGER NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('Fácil', 'Intermedio', 'Avanzado')),
      cuisine TEXT NOT NULL DEFAULT 'Española',
      image_url TEXT,
      instructions_json TEXT NOT NULL,
      allergens_json TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
    CREATE INDEX IF NOT EXISTS idx_recipes_cook_time ON recipes(cook_time_minutes);

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);

    CREATE TABLE IF NOT EXISTS recipe_tags (
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      PRIMARY KEY (recipe_id, tag)
    );

    CREATE TABLE IF NOT EXISTS recipe_image_preferences (
      recipe_id TEXT PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
      image_id TEXT NOT NULL,
      url TEXT NOT NULL,
      thumb_url TEXT NOT NULL,
      alt_description TEXT NOT NULL,
      photographer_name TEXT NOT NULL,
      photographer_url TEXT,
      is_custom INTEGER NOT NULL DEFAULT 1,
      updated_at DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weekly_plans (
      week_id TEXT PRIMARY KEY,
      updated_at DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS planned_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id TEXT NOT NULL REFERENCES weekly_plans(week_id) ON DELETE CASCADE,
      day_of_week TEXT NOT NULL CHECK(day_of_week IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
      meal_type TEXT NOT NULL CHECK(meal_type IN ('lunch', 'dinner')),
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      servings INTEGER NOT NULL DEFAULT 2,
      UNIQUE(week_id, day_of_week, meal_type)
    );
  `);
}
