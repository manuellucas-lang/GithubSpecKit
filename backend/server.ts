import { buildApp } from './app';
import { initDatabase } from './database/sqlite';
import { seedRecipes } from './database/seeds/recipes.seed';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer(): Promise<void> {
  const db = initDatabase();
  seedRecipes(db);

  const app = await buildApp({ db });

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  });
}
