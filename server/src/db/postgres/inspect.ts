import "dotenv/config";
import { connectPostgres, query } from "../../db/postgres/client";

async function main() {
  await connectPostgres();

  // Check what columns bookings currently has
  const cols = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'bookings' ORDER BY ordinal_position`,
  );
  console.log("bookings columns:", cols.map((c) => c.column_name).join(", "));

  // Check users table for lockout columns
  const ucols = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'users' ORDER BY ordinal_position`,
  );
  console.log("users columns:", ucols.map((c) => c.column_name).join(", "));

  // Check for password_reset_tokens table
  const prt = await query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'password_reset_tokens'`,
  );
  console.log("password_reset_tokens exists:", prt.length > 0);

  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
