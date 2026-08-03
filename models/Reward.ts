import mongoose, { Schema, models, model } from "mongoose";

export interface IReward {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  imageUrl: string;
  stock: number;
  price: number; // valor em Sakalekas
  category: string;
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new Schema<IReward>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, default: "Geral" },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.Reward as mongoose.Model<IReward>) || model<IReward>("Reward", RewardSchema);
