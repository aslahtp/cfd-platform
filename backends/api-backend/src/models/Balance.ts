import mongoose from "mongoose";

export interface IBalance extends mongoose.Document {
  userId: string;
  currency: string;
  free: number;
  used: number;
  updatedAt: Date;
}

const balanceSchema = new mongoose.Schema<IBalance>({
  userId: { type: String, required: true, index: true },
  currency: { type: String, required: true },
  free: { type: Number, required: true, default: 0 },
  used: { type: Number, required: true, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

balanceSchema.index({ userId: 1, currency: 1 }, { unique: true });

export const Balance =
  mongoose.models.Balance || mongoose.model<IBalance>("Balance", balanceSchema);
