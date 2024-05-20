import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const statusTable = sqliteTable("statuses", {
  id: integer('id', { mode: 'number' }).primaryKey({autoIncrement: true}),
  text: text('text'),
  date: integer('date', {mode: 'timestamp_ms'}).notNull().$default(() => new Date()),
  theme: text('theme', {enum: ['light', 'dark', 'red', 'purple']}).notNull().default('light'),
  mood: text('mood', {enum: ['neutral', 'dizzy', 'jubilant', 'dead', 'empty']}).notNull().default('neutral'),
  spotify_link: text('spotify_link'),
  _deleted_at: integer('_deleted_at', {mode: 'timestamp_ms'}),
});

export type selectStatus = InferSelectModel<typeof statusTable>;
export type insertStatus = InferInsertModel<typeof statusTable>;