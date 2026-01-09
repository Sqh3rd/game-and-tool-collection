import { eq } from "drizzle-orm";
import { users } from "hub:db:schema";
import { newUserSchema } from "~~/shared/types/common";

export default defineEventHandler(async (event) => {
  const { email, name, password, confirmPassword } = await readValidatedBody(
    event,
    newUserSchema.parse,
  );

  const usersWithSameEmail = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (usersWithSameEmail.length !== 0) {
    throw createError({
      status: 401,
      message: "E-Mail already exists",
      data: { field: "email" },
    });
  }

  const hashedPassword = await hashPassword(password);
  if (!(await verifyPassword(hashedPassword, confirmPassword))) {
    throw createError({
      status: 401,
      message: "Mismatch between password and confirm password",
      data: { field: ["password", "confirmPassword"] },
    });
  }

  const newUser = (
    await db.insert(users).values({ email, hashedPassword, name }).returning()
  )[0];

  await setUserSession(event, {
    user: { email: newUser.email, name: newUser.name },
  });

  return {};
});
