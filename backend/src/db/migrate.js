import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../db/migrations'
);

await pool.query(
  'CREATE TABLE IF NOT EXISTS schema_migrations(filename TEXT PRIMARY KEY,applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())'
);

for (
  const filename of (await fs.readdir(root))
    .filter(f => f.endsWith('.sql'))
    .sort()
) {
  const { rowCount } = await pool.query(
    'SELECT 1 FROM schema_migrations WHERE filename=$1',
    [filename]
  );

  if (rowCount) continue;

  const sql = await fs.readFile(
    path.join(root, filename),
    'utf8'
  );

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations(filename) VALUES($1)',
      [filename]
    );
    await client.query('COMMIT');

    console.log(`Applied ${filename}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

await pool.end();