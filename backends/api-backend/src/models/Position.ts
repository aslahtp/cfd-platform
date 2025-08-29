import mongoose from "mongoose";

export type PositionSide = "long" | "short";

export interface IPosition extends mongoose.Document {
  userId: string;
  instrument: string;
  qty: number;
  entryPrice: number;
  leverage: number;
  side: PositionSide;
  createdAt: Date;
  updatedAt: Date;
}

const positionSchema = new mongoose.Schema<IPosition>(
  {
    userId: { type: String, required: true, index: true },
    instrument: { type: String, required: true, index: true },
    qty: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    leverage: { type: Number, required: true, default: 1 },
    side: { type: String, enum: ["long", "short"], required: true },
  },
  { timestamps: true }
);

positionSchema.index({ userId: 1, instrument: 1 }, { unique: true });

export const Position =
  mongoose.models.Position || mongoose.model<IPosition>("Position", positionSchema);