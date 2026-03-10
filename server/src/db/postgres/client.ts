import { Pool, PoolClient } from 'pg';
import { env } from '../../config/env';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) throw new Error('PostgreSQL not initialised — call connectPostgres() first');
  return pool;
}

export async function connectPostgres(): Promise<void> {
  pool = new Pool({
    host:     env.POSTGRES.HOST,
    port:     env.POSTGRES.PORT,
    user:     env.POSTGRES.USER,
    password: env.POSTGRES.PASSWORD,
    database: env.POSTGRES.DB,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

  const client = await pool.connect();
  client.release();
  console.log('✅  PostgreSQL connected');
}

/** Run a query and return all rows */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

/** Run a query and return the first row or null */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Run multiple queries in a single transaction */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
