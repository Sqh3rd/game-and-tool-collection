import mongoose from "mongoose";

const config = useRuntimeConfig();
export const connect = () => mongoose.connect(config.DATABASE_HOST);
