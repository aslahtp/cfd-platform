import mongoose from "mongoose";

const candleSchema = new mongoose.Schema({
  symbol: { type: String, index: true },
  interval: { type: String, index: true }, // "1m"|"5m"|"10m"
  ts: { type: Number, index: true },    
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: { type: Number, default: 0 }, 
  quoteVolume: { type: Number, default: 0 },
  trades: { type: Number, default: 0 }
}, { timestamps: true });

candleSchema.index({ symbol: 1, interval: 1, ts: 1 }, { unique: true });

export const Candle = mongoose.model("Candle", candleSchema);