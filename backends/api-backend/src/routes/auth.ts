import express, { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../services/jwt";

const authRoutes = express.Router();

authRoutes.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const newUser = new User({ name, email, password });
      await newUser.save();
      return res.status(201).json({
        message: "User created successfully",
        token: generateToken(newUser.userId as string),
      });
    } catch (e: any) {
      if (e?.code === 11000) {
        return res.status(400).json({ message: "User already exists" });
      }
      throw e;
    }
  } catch (error) {
    console.error("Error creating user", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRoutes.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "User signed in successfully",
      token: generateToken(user.userId as string),
    });
  } catch (error) {
    console.error("Error signing in", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default authRoutes;
