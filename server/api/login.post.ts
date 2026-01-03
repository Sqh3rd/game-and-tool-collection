import z from "zod";


const bodySchema = z.object({
    email: z.email(),
    password: z.string().min(32)
});

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, bodySchema.parse);
    const config = useRuntimeConfig();

    const hashedPwd = await hashPassword(password);

    if (email === config.devAdminMail && await verifyPassword(hashedPwd, config.devAdminPwd)) {
        await setUserSession(event, {
            user: {
                name: "John Doe"
            }
        });
        return {};
    }
    throw createError({
        status: 401,
        message: "Invalid Email or password"
    });
});