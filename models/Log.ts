import mongoose, { Schema, models, model } from "mongoose";

export interface ILog {
  _id: mongoose.Types.ObjectId;
  actor?: mongoose.Types.ObjectId; // quem executou a ação (null = sistema)
  action: string; // ex: "user.create", "reward.update", "sakalekas.grant"
  targetType?: string; // ex: "User", "Reward"
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true, index: true },
    targetType: { type: String },
    targetId: { type: String },
    details: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default (models.Log as mongoose.Model<ILog>) || model<ILog>("Log", LogSchema);
