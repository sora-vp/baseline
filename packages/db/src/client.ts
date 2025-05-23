import { and, count, eq, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { connectionStr } from "./config";
import * as schema from "./schema/main";

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

export const preparedAdminGetCandidates = db.query.candidates
  .findMany()
  .prepare();

export const preparedGetCandidateCountsOnly = db.query.candidates
  .findMany({
    columns: {
      counter: true,
    },
    where: gt(schema.candidates.counter, 0),
  })
  .prepare();

export const preparedGetAttendedAndVoted = db
  .select({ count: count() })
  .from(schema.participants)
  .where(
    and(
      eq(schema.participants.alreadyAttended, true),
      eq(schema.participants.alreadyChoosing, true),
    ),
  )
  .prepare();

export const preparedGetGraphicalData = db.query.candidates
  .findMany({
    columns: {
      name: true,
      counter: true,
    },
  })
  .prepare();

export const preparedGetParticipantAttended = db.query.participants
  .findFirst({
    where: eq(schema.participants.qrId, sql.placeholder("qrId")),

    columns: {
      alreadyAttended: true,
      alreadyChoosing: true,
    },
  })
  .prepare();

export const preparedGetParticipantStatus = db.query.participants
  .findFirst({
    where: eq(schema.participants.qrId, sql.placeholder("qrId")),

    columns: {
      name: true,
      subpart: true,
      alreadyAttended: true,
      alreadyChoosing: true,
    },
  })
  .prepare();

export const preparedGetCandidates = db.query.candidates
  .findMany({
    columns: {
      counter: false,
    },
  })
  .prepare();
//
// export const preparedGetParticipantsStatistic = db.query.participants
//   .findMany({
//     columns: {
//       id: false,
//     },
//   })
//   .prepare();
