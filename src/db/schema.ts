import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const icons = pgTable(
  "icons",
  {
    id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
    name: text("name").notNull(),
    library: text("library").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    libraryIdx: index("icons_library_idx").on(table.library),
    libraryNameIdx: index("icons_library_name_idx").on(table.library, table.name),
  }),
);

export type Icon = typeof icons.$inferSelect;
export type NewIcon = typeof icons.$inferInsert;
