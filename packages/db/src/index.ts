import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { connectionStr } from "./config";
import * as mainSchema from "./schema/main";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/mysql-core";

const poolConnection = mysql.createPool(connectionStr.toString());

export const db = drizzle(poolConnection, {
  schema: mainSchema,
  mode: "default",
});

// Prepared statement stuff
export const preparedGetUserByEmail = db.query.users
  .findFirst({
    where: eq(mainSchema.users.email, sql.placeholder("email")),
  })
  .prepare();
