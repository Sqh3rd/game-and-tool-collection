import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { notNull } from "./shared/utils/type-assertions";

export default defineConfig({
    out: "./drizzle",
    schema: "./db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: notNull(process.env.DATABASE_URL)
    }
});