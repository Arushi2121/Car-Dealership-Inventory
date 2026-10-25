import 'dotenv/config';
import { createApp } from './app.js';
import { databaseSchema, loadConfig } from './shared/config.js';
import { createPrismaClient } from './shared/db.js';

const config = loadConfig();
const prisma = createPrismaClient(config.DATABASE_URL);
const app = createApp({ prisma, config });
const schema = databaseSchema(config.DATABASE_URL);

app.listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}`);
  console.log(`Database schema: ${schema}`);
});
