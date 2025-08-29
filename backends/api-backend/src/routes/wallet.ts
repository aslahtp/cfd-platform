import express, { Request, Response } from "express";
import { verifyToken } from "../services/jwt";
import { User } from "../models/User";
import { Balance } from "../models/Balance";

const walletRoutes = express.Router();

/* walletRoutes.get("/", (req: Request, res: Response) => {
  res.send("Hello World from wallet");
}); */

walletRoutes.post("/deposit", async (req: Request, res: Response) => {
  const { amount} = req.body;
  const decoded = verifyToken(req.headers.token as string);
  console.log(decoded);
  
  if (typeof decoded === 'string' || !decoded.userId) {
    return res.status(401).json({ message: "Invalid token" });
  }
  
  const user = await User.findOne({ userId: decoded.userId });
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const balance = await Balance.findOne({ userId: user.userId });
  if (!balance) {
    const newBalance = new Balance({ userId: user.userId, currency: "USDT", free: amount, used: 0 });
    await newBalance.save();
    return res.status(200).json({ message: "Balance created" });
  }
  balance.free += amount;
  await balance.save();
  return res.status(200).json({ message: "Balance updated" });
});

walletRoutes.get("/balance", async (req: Request, res: Response) => {
  const decoded = verifyToken(req.headers.token as string);
  console.log(decoded);
  if (typeof decoded === 'string' || !decoded.userId) {
    return res.status(401).json({ message: "Invalid token" });
  }
  const user = await User.findOne({ userId: decoded.userId });
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const balance = await Balance.findOne({ userId: user.userId });
  return res.status(200).json({ message: "Balance fetched", balance });

});

export default walletRoutes;