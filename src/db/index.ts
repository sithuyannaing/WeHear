import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

type AppDb =
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePg<typeof schema>>;

let _db: AppDb | null = null;

function isNeonUrl(connectionString: string): boolean {
  return connectionString.includes("neon.tech");
}

export function getDb(): AppDb {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    if (isNeonUrl(connectionString)) {
      _db = drizzleNeon(neon(connectionString), { schema });
    } else {
      const client = postgres(connectionString, {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      _db = drizzlePg(client, { schema });
    }
  }
  return _db;
}
