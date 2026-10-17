import pg from "pg";
import { pgConnectionString } from "./pg-connection.js";

const { Pool } = pg;

const connectionString = pgConnectionString(process.env.DATABASE_URL ?? "");

if (!connectionString) {
  console.error("DATABASE_URL não está definida.");
  process.exit(1);
}

export const pool = new Pool({ connectionString });

export async function checkDatabase() {
  await pool.query("SELECT 1");
}
