import mongoose, { Schema, models, model } from "mongoose";

export type TransactionType = "credit" | "debit";
export type TransactionSource =
  | "admin_grant"
  | "admin_revoke"
  | "goal_completed"
  | "purchase"
  | "bulk_distribution"
  | "adjustment";

export interface ITransaction {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  balanceAfter: number;
  note?: string;
  performedBy?: mongoose.Types.ObjectId; // admin responsável, quando aplicável
  relatedGoal?: mongoose.Types.ObjectId;
  relatedPurchase?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    source: {
      type: String,
      enum: [
        "admin_grant",
        "admin_revoke",
        "goal_completed",
        "purchase",
        "bulk_distribution",
        "adjustment",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    note: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    relatedGoal: { type: Schema.Types.ObjectId, ref: "Goal" },
    relatedPurchase: { type: Schema.Types.ObjectId, ref: "Purchase" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default (models.Transaction as mongoose.Model<ITransaction>) ||
  model<ITransaction>("Transaction", TransactionSchema);
