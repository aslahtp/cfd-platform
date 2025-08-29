import mongoose from "mongoose";

export interface ITrade extends mongoose.Document {
  orderId: string;
  positionId: string | null;
  userId: string;
  instrument: string;
  qty: number;
  price: number;
  fee: number;
  ts: Date;
}

const tradeSchema = new mongoose.Schema<ITrade>({
  orderId: { type: String, required: true, index: true },
  positionId: { type: String, default: null, index: true },
  userId: { type: String, required: true, index: true },
  instrument: { type: String, required: true, index: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  fee: { type: Number, required: true, default: 0 },
  ts: { type: Date, default: Date.now, index: true },
});

export const Trade =
  mongoose.models.Trade || mongoose.model<ITrade>("Trade", tradeSchema);