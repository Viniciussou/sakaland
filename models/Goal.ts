import mongoose, { Schema, models, model } from "mongoose";

export interface IGoal {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  reward: number; // Sakalekas concedidas ao concluir
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  completedBy: mongoose.Types.ObjectId[]; // participantes que já concluíram
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    reward: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default (models.Goal as mongoose.Model<IGoal>) || model<IGoal>("Goal", GoalSchema);
