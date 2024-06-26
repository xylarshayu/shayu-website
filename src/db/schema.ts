import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const statusTable = sqliteTable("statuses", {
  id: integer('id', { mode: 'number' }).primaryKey({autoIncrement: true}),
  text: text('text'), // Markdown
  date: integer('date', {mode: 'timestamp_ms'}).notNull().$default(() => new Date()),
  theme: text('theme', {enum: ['light', 'dark', 'red', 'purple']}).notNull().default('light'),
  mood: text('mood', {enum: ['neutral', 'dizzy', 'jubilant', 'irked', 'dead', 'empty']}).notNull().default('neutral'),
  image: text('image'), // Source link of image
  spotify_link: text('spotify_link'),
  _deleted_at: integer('_deleted_at', {mode: 'timestamp_ms'}),
});

export type selectStatus = InferSelectModel<typeof statusTable>;
export type insertStatus = InferInsertModel<typeof statusTable>;

export const postTable = sqliteTable("posts", {
  id: integer('id', { mode: 'number' }).primaryKey({autoIncrement: true}),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  text: text('text'), // Markdown
  date: integer('date', {mode: 'timestamp_ms'}).notNull().$default(() => new Date()),
  type: text('type', {enum: ['poem', 'article']}).notNull().default('article'),
  image: text('image'), // Source link of image
  textColor: text('textColor').default('var(--defaultText)'),
  backgroundColor: text('backgroundColor').default('var(--defaultBackground)'),
  _deleted_at: integer('_deleted_at', {mode: 'timestamp_ms'}),
});

export type selectPost = InferSelectModel<typeof postTable>;
export type insertPost = InferInsertModel<typeof postTable>;