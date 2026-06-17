import 'reflect-metadata';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import postgres from 'postgres';
import { createDb, stations } from '@voltaway/db';
import { AppModule } from './app.module';
import { seedDatabase } from './seed';

async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  const migrationsDir = join(__dirname, '../../../packages/db/drizzle');
  const sql = postgres(url, { max: 1 });

  await sql`CREATE TABLE IF NOT EXISTS drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  try {
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const existing = await sql`SELECT 1 FROM drizzle_migrations WHERE hash = ${file}`;
      if (existing.length > 0) continue;
      await sql.unsafe(readFileSync(join(migrationsDir, file), 'utf8'));
      await sql`INSERT INTO drizzle_migrations (hash) VALUES (${file})`;
      console.log(`Applied migration: ${file}`);
    }
  } catch (err) {
    console.warn('Migration skipped or failed:', err);
  } finally {
    await sql.end();
  }
}

async function bootstrap() {
  await runMigrations();

  const url = process.env.DATABASE_URL;
  if (url) {
    const db = createDb(url);
    const existing = await db.select().from(stations).limit(1);
    if (existing.length === 0) {
      await seedDatabase(db);
      console.log('Database seeded');
    }
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`api listening on :${port}`);
}

bootstrap();
