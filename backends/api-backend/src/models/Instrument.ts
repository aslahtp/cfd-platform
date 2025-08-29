import mongoose from "mongoose";

export interface IInstrument extends mongoose.Document {
  symbol: string;
  tickSize: number;
  maintenanceMarginPercent: number;
}

const instrumentSchema = new mongoose.Schema<IInstrument>({
  symbol: { type: String, required: true, unique: true, uppercase: true, index: true },
  tickSize: { type: Number, required: true },
  maintenanceMarginPercent: { type: Number, required: true },
});

export const Instrument =
  mongoose.models.Instrument || mongoose.model<IInstrument>("Instrument", instrumentSchema);