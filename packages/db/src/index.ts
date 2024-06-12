import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { connectionStr } from "./config";
import * as schema from "./schema/main";

export * as schema from "./schema/main";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/mysql-core";

const poolConnection = mysql.createPool(connectionStr.toString());

export const db = drizzle(poolConnection, {
  schema,
  mode: "default",
});

// Prepared statement stuff
export const preparedGetUserByEmail = db.query.users
  .findFirst({
    where: eq(schema.users.email, sql.placeholder("email")),
  })
  .prepare();

export const countUserTable = db
  .select({ count: sql`count(*)`.mapWith(Number) })
  .from(schema.users)
  .prepare();

export const preparedGetAllParticipants = db.query.participants
  .findMany({
    columns: {
      id: false,
    },
  })
  .prepare();

export const preparedGetExcelParticipants = db.query.participants
  .findMany({
    columns: {
      name: true,
      qrId: true,
      subpart: true,
    },
  })
  .prepare();
