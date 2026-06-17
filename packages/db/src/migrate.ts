import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'drizzle');

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  const sql = postgres(url, { max: 1 });
  await sql`CREATE TABLE IF NOT EXISTS drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const hash = file;
    const existing = await sql`SELECT 1 FROM drizzle_migrations WHERE hash = ${hash}`;
    if (existing.length > 0) continue;

    const content = readFileSync(join(migrationsDir, file), 'utf8');
    await sql.unsafe(content);
    await sql`INSERT INTO drizzle_migrations (hash) VALUES (${hash})`;
    console.log(`Applied migration: ${file}`);
  }

  await sql.end();
  console.log('Migrations complete');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
