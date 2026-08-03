"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Setting } from "@/models";
import { requireAdmin } from "@/lib/auth";
import { recordLog } from "@/lib/audit";
import type { ActionState } from "./auth.actions";

export async function getSettings() {
  await connectToDatabase();
  let settings = await Setting.findOne().lean();
  if (!settings) {
    const now = new Date();
    const inSixMonths = new Date();
    inSixMonths.setMonth(now.getMonth() + 6);
    settings = (
      await Setting.create({
        eventStartDate: now,
        eventEndDate: inSixMonths,
      })
    ).toObject();
  }
  return JSON.parse(JSON.stringify(settings));
}

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  let settings = await Setting.findOne();
  if (!settings) settings = new Setting({});

  settings.eventName = String(formData.get("eventName") || settings.eventName);
  settings.currencyName = String(formData.get("currencyName") || settings.currencyName);
  settings.currencySingular = String(
    formData.get("currencySingular") || settings.currencySingular
  );
  settings.eventStartDate = new Date(
    String(formData.get("eventStartDate") || settings.eventStartDate)
  );
  settings.eventEndDate = new Date(
    String(formData.get("eventEndDate") || settings.eventEndDate)
  );
  settings.primaryColor = String(formData.get("primaryColor") || settings.primaryColor);

  settings.features = {
    storeEnabled: formData.get("storeEnabled") === "on",
    rankingEnabled: formData.get("rankingEnabled") === "on",
    goalsEnabled: formData.get("goalsEnabled") === "on",
    registrationEnabled: formData.get("registrationEnabled") === "on",
  };

  settings.automatedMessages = {
    purchaseConfirmation: String(
      formData.get("purchaseConfirmation") ||
        settings.automatedMessages.purchaseConfirmation
    ),
    goalCompleted: String(
      formData.get("goalCompleted") || settings.automatedMessages.goalCompleted
    ),
    welcomeMessage: String(
      formData.get("welcomeMessage") || settings.automatedMessages.welcomeMessage
    ),
  };

  await settings.save();

  await recordLog({
    actor: admin.userId,
    action: "settings.update",
  });

  revalidatePath("/admin/settings");
  return { success: true, message: "Configurações salvas com sucesso." };
}
