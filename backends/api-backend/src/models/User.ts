import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("validate", function (next) {
  if (!this.userId) {
    this.userId = uuidv4();
  }
  next();
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
