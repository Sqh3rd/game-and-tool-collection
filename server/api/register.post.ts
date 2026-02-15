import { eq } from "drizzle-orm";
import { user } from "hub:db:schema";
import { User } from "~~/shared/types/db";

export default defineEventHandler(async (event) => {
  const { email, name, password, confirmPassword } = await readValidatedBody(
    event,
    User.insertSchema.parse,
  );

  const usersWithSameEmail = await db
    .select()
    .from(user)
    .where(eq(user.email, email));
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
    await db.insert(user).values({ email, hashedPassword, name }).returning()
  )[0];

  await setUserSession(event, {
    user: { email: newUser.email, name: newUser.name },
  });

  return {};
});
