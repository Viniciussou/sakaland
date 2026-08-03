import mongoose, { Schema, models, model } from "mongoose";

// Documento único (singleton) com as configurações gerais do evento
export interface ISetting {
  _id: mongoose.Types.ObjectId;
  eventName: string;
  eventStartDate: Date;
  eventEndDate: Date;
  currencyName: string; // "Sakalekas"
  currencySingular: string; // "Sakaleka"
  logoUrl?: string;
  primaryColor: string;
  features: {
    storeEnabled: boolean;
    rankingEnabled: boolean;
    goalsEnabled: boolean;
    registrationEnabled: boolean;
  };
  automatedMessages: {
    purchaseConfirmation: string;
    goalCompleted: string;
    welcomeMessage: string;
  };
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    eventName: { type: String, default: "Sakaland" },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    currencyName: { type: String, default: "Sakalekas" },
    currencySingular: { type: String, default: "Sakaleka" },
    logoUrl: { type: String },
    primaryColor: { type: String, default: "#C8102E" },
    features: {
      storeEnabled: { type: Boolean, default: true },
      rankingEnabled: { type: Boolean, default: true },
      goalsEnabled: { type: Boolean, default: true },
      registrationEnabled: { type: Boolean, default: true },
    },
    automatedMessages: {
      purchaseConfirmation: {
        type: String,
        default: "Seu resgate foi confirmado! Em breve entraremos em contato.",
      },
      goalCompleted: {
        type: String,
        default: "Parabéns! Você concluiu uma meta e recebeu Sakalekas.",
      },
      welcomeMessage: {
        type: String,
        default: "Bem-vindo ao Sakaland! Cumpra metas, acumule Sakalekas e troque por brindes.",
      },
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default (models.Setting as mongoose.Model<ISetting>) || model<ISetting>("Setting", SettingSchema);
