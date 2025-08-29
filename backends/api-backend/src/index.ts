import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./services/database";

import walletRoutes from "./routes/wallet";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
