import pkg from "pg";
import assert from "node:assert";

const { Pool } = pkg;

assert(process.env.PGHOST, "PGHOST env variable is required");
assert(process.env.PGUSER, "PGUSER env variable is required");
assert(process.env.PGPASSWORD, "PGPASSWORD env variable is required");
assert(process.env.PGDATABASE, "PGDATABASE env variable is required");
assert(process.env.PGPORT, "PGPORT env variable is required");

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT),
});

export function query(text, params) {
  return pool.query(text, params);
}
