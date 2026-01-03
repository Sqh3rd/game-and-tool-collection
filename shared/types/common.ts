import { users } from "hub:db:schema";

export type User = typeof users.$inferSelect;

export type NewUser = Omit<typeof users.$inferInsert, "hashedPassword"> & { password: string };