import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { businesses } from "../src/db/schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  const [existing] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .limit(1);

  if (existing) {
    console.log(`Business already exists with id: ${existing.id}`);
    console.log("Set DEMO_BUSINESS_ID in .env to this value.");
    await client.end();
    return;
  }

  const [business] = await db
    .insert(businesses)
    .values({ name: "Demo Coffee Shop" })
    .returning({ id: businesses.id, name: businesses.name });

  console.log(`Created business: ${business.name} (id: ${business.id})`);
  console.log(`Set DEMO_BUSINESS_ID in .env to: ${business.id}`);
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
