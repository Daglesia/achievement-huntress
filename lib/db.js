import { Pool } from 'pg';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const usePostgres = !!process.env.DATABASE_URL;
export const dbBackend = usePostgres ? 'postgres' : 'sqlite';

let pgPool;
let sqliteDb;
let ready;

function initSqlite() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, 'dev.db'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_schemas (
      appid INTEGER PRIMARY KEY,
      game_name TEXT,
      data TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

async function initPg() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_schemas (
      appid BIGINT PRIMARY KEY,
      game_name TEXT,
      data JSONB NOT NULL,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  return pool;
}

// Lazily create the table(s) on first use, once per process.
function ensureReady() {
  if (!ready) {
    ready = usePostgres
      ? initPg().then((pool) => { pgPool = pool; })
      : Promise.resolve().then(() => { sqliteDb = initSqlite(); });
  }
  return ready;
}

// Returns { data, gameName, fetchedAt } or null if nothing cached yet.
export async function getGameSchema(appid) {
  await ensureReady();

  if (usePostgres) {
    const { rows } = await pgPool.query(
      'SELECT data, game_name, fetched_at FROM game_schemas WHERE appid = $1',
      [appid]
    );
    if (rows.length === 0) return null;
    // pg parses jsonb columns into JS objects automatically.
    return { data: rows[0].data, gameName: rows[0].game_name, fetchedAt: rows[0].fetched_at };
  }

  const row = sqliteDb
    .prepare('SELECT data, game_name, fetched_at FROM game_schemas WHERE appid = ?')
    .get(appid);
  if (!row) return null;
  return { data: JSON.parse(row.data), gameName: row.game_name, fetchedAt: row.fetched_at };
}

export async function saveGameSchema(appid, gameName, data) {
  await ensureReady();

  if (usePostgres) {
    await pgPool.query(
      `INSERT INTO game_schemas (appid, game_name, data, fetched_at)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (appid) DO UPDATE
         SET game_name = EXCLUDED.game_name, data = EXCLUDED.data, fetched_at = now()`,
      [appid, gameName, JSON.stringify(data)]
    );
    return;
  }

  sqliteDb
    .prepare(
      `INSERT INTO game_schemas (appid, game_name, data, fetched_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(appid) DO UPDATE SET
         game_name = excluded.game_name,
         data = excluded.data,
         fetched_at = excluded.fetched_at`
    )
    .run(appid, gameName, JSON.stringify(data));
}
