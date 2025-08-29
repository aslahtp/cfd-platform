import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const authRoutes = express.Router();

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
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
const User = mongoose.model("User", userSchema);

authRoutes.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ email, password });
    await newUser.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRoutes.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET as string
    );
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error signing in", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default authRoutes;
