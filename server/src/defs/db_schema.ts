/**
 * Database Schema
 *
 * Define your app tables here using Drizzle ORM.
 * If you want app-level `relations(...)`, define them in `src/defs/db_relations.ts`.
 *
 * After making changes, run:
 *   edgespark db generate   (create migration files)
 *   edgespark db migrate    (apply to the project database)
 *   edgespark deploy        (deploy with latest schema)
 */

import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { esSystemAuthUser } from "../__generated__/sys_schema";

// Example table — replace with your own schema:
//
// export const users = sqliteTable("users", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   name: text("name").notNull(),
//   email: text("email").notNull().unique(),
//   created_at: text("created_at").notNull().default(sql`(current_timestamp)`),
// });

export const readingRecords = sqliteTable(
  "reading_records",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => esSystemAuthUser.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    mode: text("mode", { enum: ["question", "daily"] }).notNull(),
    cardsJson: text("cards_json").notNull(),
    aiSummary: text("ai_summary").notNull(),
    aiFullText: text("ai_full_text").notNull(),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index("reading_records_user_created_idx").on(table.userId, table.createdAt),
  ],
);
