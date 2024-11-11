import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost", // replace with your database host
    database: "DMSFinal", // replace with your database name
    user: "postgres", // replace with your database user
    password: "12345678", // replace with your database password
    port: 5432,
    ssl: false,
  },
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  verbose: true,
  strict: true,
  migrations: {
    table: "migrations",
    schema: "public",
  },
});
