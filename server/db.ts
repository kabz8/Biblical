import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL in production; local Replit DB does not
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Limit connections per serverless function instance (Vercel)
  max: isProduction ? 1 : 10,
});

export const db = drizzle(pool, { schema });
