import { drizzle } from "drizzle-orm/node-postgres";

const config = useRuntimeConfig();
const db = drizzle(config.DATABASE_URL);