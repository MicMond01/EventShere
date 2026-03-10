import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) throw new Error('PostgreSQL not connected. Call connectPostgres() first.');
  return pool;
}

export async function connectPostgres(): Promise<void> {
  pool = new Pool({
    host:     process.env.POSTGRES_HOST     || 'localhost',
    port:     Number(process.env.POSTGRES_PORT) || 5432,
    user:     process.env.POSTGRES_USER     || 'eventshere_user',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB       || 'eventshere_db',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test the connection
  const client = await pool.connect();
  client.release();
  console.log('PostgreSQL connected');
}

export async function query<T = any>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await getPool().query(text, params);
  return rows as T[];
}

export async function queryOne<T = any>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
