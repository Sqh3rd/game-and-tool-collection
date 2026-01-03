import z from "zod";

const config = useRuntimeConfig();

const bodySchema = z.object({
    email: z.email(),
    name: z.string(),
    password: z.string().min(32)
});

export default defineEventHandler(async (event) => {
    const { email, password, name } = await readValidatedBody(event, bodySchema.parse);

    // check if password is secure enough
    // check if email or name already exists
});