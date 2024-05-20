import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './migrations',
  dbCredentials: {
    wranglerConfigPath: '.',
    dbName: 'shayu-db-d1-2024-5'
  },
  driver: 'd1',
  verbose: true,
  strict: true
});