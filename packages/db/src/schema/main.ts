import {
  boolean,
  int,
  mysqlEnum,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { nanoid } from "@sora-vp/id-generator";

import { mySqlTable } from "./_table";

export const users = mySqlTable(
  "user",
  {
    id: int("id").autoincrement().primaryKey(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    verifiedAt: timestamp("verified_at", { mode: "date" }),
    role: mysqlEnum("role", ["admin", "comittee"]),
  },
  (users) => ({
    emailIndex: uniqueIndex("email_unique_index").on(users.email),
  }),
);

export const candidates = mySqlTable("candidate", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  counter: int("counter").notNull().default(0),
  image: varchar("image", { length: 100 }).notNull(),
});

export const participants = mySqlTable(
  "participant",
  {
    id: int("id").autoincrement().primaryKey(),
    name: text("name").notNull(),
    subpart: varchar("sub_part", { length: 50 }).notNull(),
    qrId: varchar("qr_id", { length: 30 }).$defaultFn(() => nanoid()),

    // CRITICAL FEATURE, for presence functionality
    alreadyAttended: boolean("already_attended").default(false).notNull(),
    attendedAt: timestamp("attended_at", { mode: "date" }),

    // VERY VERY CRITICAL, for vote functionality
    alreadyChoosing: boolean("already_choosing").default(false).notNull(),
    choosingAt: timestamp("choosing_at", { mode: "date" }),
  },
  (participants) => ({
    qrIdIndex: uniqueIndex("qr_id_unique_index").on(participants.qrId),
  }),
);
