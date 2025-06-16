import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  name: String,
  email: String,
});

export const User = mongoose.model("User", schema);
