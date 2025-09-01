import express, { Request, Response } from "express";

const orderRoutes = express.Router();

orderRoutes.get("/", (req: Request, res: Response) => {
  res.send("Hello World from order");
});

export default orderRoutes;
