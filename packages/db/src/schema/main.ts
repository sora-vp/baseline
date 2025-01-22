import { uniqueIndex } from "drizzle-orm/mysql-core";

import { nanoid } from "@sora-vp/id-generator";

import { mySqlTable } from "./_table";

export const users = mySqlTable(
  "user",
  (t) => ({
    id: t.int("id").autoincrement().primaryKey(),
    name: t.text("name").notNull(),
    email: t.varchar("email", { length: 255 }).notNull(),
    password: t.varchar("password", { length: 255 }).notNull(),
    verifiedAt: t.timestamp("verified_at", { mode: "date" }),
    role: t.mysqlEnum("role", ["admin", "comittee"]),
  }),
  (users) => [uniqueIndex("email_unique_index").on(users.email)],
);

export const candidates = mySqlTable("candidate", (t) => ({
  id: t.int("id").autoincrement().primaryKey(),
  name: t.text("name").notNull(),
  counter: t.int("counter").notNull().default(0),
  image: t.varchar("image", { length: 100 }).notNull(),
}));

export const participants = mySqlTable(
  "participant",
  (t) => ({
    id: t.int("id").autoincrement().primaryKey(),
    name: t.text("name").notNull(),
    subpart: t.varchar("sub_part", { length: 50 }).notNull(),
    qrId: t.varchar("qr_id", { length: 30 }).$defaultFn(() => nanoid()),

    // CRITICAL FEATURE, for presence functionality
    alreadyAttended: t.boolean("already_attended").default(false).notNull(),
    attendedAt: t.timestamp("attended_at", { mode: "date" }),

    // VERY VERY CRITICAL, for vote functionality
    alreadyChoosing: t.boolean("already_choosing").default(false).notNull(),
    choosingAt: t.timestamp("choosing_at", { mode: "date" }),
  }),
  (participants) => [uniqueIndex("qr_id_unique_index").on(participants.qrId)],
);
