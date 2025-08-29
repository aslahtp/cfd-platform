import express from "express";
import dotenv from "dotenv";
import connectDB from "./services/database";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
