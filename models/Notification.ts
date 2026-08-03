import mongoose, { Schema, models, model } from "mongoose";

export type NotificationChannel = "system" | "email" | "whatsapp";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId; // usuário destinatário (pode ser admin)
  title: string;
  message: string;
  channel: NotificationChannel;
  read: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ["system", "email", "whatsapp"], default: "system" },
    read: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default (models.Notification as mongoose.Model<INotification>) || model<INotification>("Notification", NotificationSchema);
