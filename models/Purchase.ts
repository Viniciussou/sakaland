import mongoose, { Schema, models, model } from "mongoose";

export type PurchaseStatus = "pending" | "delivered" | "cancelled";

export interface IPurchase {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  reward: mongoose.Types.ObjectId;
  rewardNameSnapshot: string;
  priceSnapshot: number;
  status: PurchaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reward: { type: Schema.Types.ObjectId, ref: "Reward", required: true },
    rewardNameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default (models.Purchase as mongoose.Model<IPurchase>) || model<IPurchase>("Purchase", PurchaseSchema);
