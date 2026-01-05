import { eq } from "drizzle-orm";
import { users } from "hub:db:schema";
import z from "zod";


const bodySchema = z.object({
    email: z.email(),
    password: z.string().min(16).max(256)
});

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, bodySchema.parse);

    const userQuery = await db.select().from(users).where(eq(users.email, email));
    if (userQuery.length === 0 || userQuery[0] == null) {
        throw createError({
            status: 401,
            message: "Invalid E-Mail Address"
        });
    }
    const user = userQuery[0];
    const isPwdValid = verifyPassword(user.hashedPassword, password);
    if (!isPwdValid) {
        throw createError({
            status: 401,
            message: "Incorrect Password"
        });
    }

    if (passwordNeedsReHash(user.hashedPassword)) {
        const newlyHashedPwd = await hashPassword(password);
        db.update(users)
            .set({ hashedPassword: newlyHashedPwd })
            .where(eq(users.id, user.id));
    }

    await setUserSession(event, {
        user: {
            email: user.email,
            name: user.name
        }
    });

    return {};
});