import express from "express";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateToken } from "../services/jwt";
dotenv.config();

const authRoutes = express.Router();

const userSchema = new mongoose.Schema({
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
const User = mongoose.model("User", userSchema);

authRoutes.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    return res.status(201).json({ message: "User created successfully", token: generateToken(newUser.userId as string) });
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
    
    return res.status(200).json({ message: "User signed in successfully", token: generateToken(user.userId as string) });
  } catch (error) {
    console.error("Error signing in", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default authRoutes;
