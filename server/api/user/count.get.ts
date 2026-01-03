import { count } from "drizzle-orm";
import { db } from "hub:db";
import { users } from "~~/server/db/schema/users";

export default defineEventHandler(async (event) => {
    return (await db.select({ count: count() }).from(users))[0].count;
})