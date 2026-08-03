import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "participant";
  avatarUrl?: string;
  department?: string;
  balance: number; // saldo atual de Sakalekas
  isBlocked: boolean;
  permissions: string[]; // permissões finas dentro do papel de admin
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "participant"],
      default: "participant",
    },
    avatarUrl: { type: String },
    department: { type: String },
    balance: { type: Number, default: 0, min: 0 },
    isBlocked: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

UserSchema.index({ balance: -1 });

export default (models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);
