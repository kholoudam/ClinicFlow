import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  max: env.DB_POOL_MAX,
});