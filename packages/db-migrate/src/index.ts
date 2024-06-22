import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

const sourceDir = new URL("../migrations", import.meta.url);
console.log("launched...");

(async () => {
  const connectionString = process.env.DATABASE_URL!;
  const sql = await mysql.createConnection(connectionString);
  const db = drizzle(sql);

  console.log("migrating database...");
  await migrate(db, { migrationsFolder: sourceDir.pathname });
  console.log("migrations successful.");
  process.exit(0);
})().catch((e) => {
  // Deal with the fact the chain failed
  console.error("migration failed");
  console.error(e);
  process.exit(1);
});