import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "@sora-vp/db/schema";

import { env } from "./env";

const connectionStr = new URL(`mysql://${env.DB_HOST}/${env.DB_NAME}`);
connectionStr.username = env.DB_USERNAME;
connectionStr.password = env.DB_PASSWORD;

const poolConnection = mysql.createPool(connectionStr.toString());

export const db = drizzle(poolConnection, {
  schema,
  mode: "default",
});

export { schema };
