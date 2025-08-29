import mongoose from "mongoose";

export type OrderSide = "buy" | "sell";
export type OrderStatus = "new" | "open" | "partial" | "filled" | "canceled" | "rejected";

export interface IOrder extends mongoose.Document {
  userId: string;
  instrument: string;
  side: OrderSide;
  qty: number;
  leverage: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    instrument: { type: String, required: true, index: true },
    side: { type: String, enum: ["buy", "sell"], required: true },
    qty: { type: Number, required: true },
    leverage: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ["new", "open", "partial", "filled", "canceled", "rejected"],
      required: true,
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);