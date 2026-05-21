import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '..', 'migrations');

async function main() {
  await pool.query(`
    create table if not exists public.schema_migrations (
      filename text primary key,
      executed_at timestamp without time zone default now()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const exists = await pool.query(
      'select 1 from public.schema_migrations where filename = $1',
      [file]
    );

    if (exists.rowCount > 0) {
      console.log(`skip ${file}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await pool.query('begin');
    try {
      await pool.query(sql);
      await pool.query('insert into public.schema_migrations (filename) values ($1)', [file]);
      await pool.query('commit');
      console.log(`ok ${file}`);
    } catch (error) {
      await pool.query('rollback');
      throw error;
    }
  }

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
