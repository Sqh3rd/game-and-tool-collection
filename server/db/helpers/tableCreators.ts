import { pgTableCreator } from "drizzle-orm/pg-core";

export const fagrcTable = pgTableCreator((name) => `fagrc_${name}`);
