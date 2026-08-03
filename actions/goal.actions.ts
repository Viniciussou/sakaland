"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Goal, User, Transaction } from "@/models";
import { requireAdmin, requireSession } from "@/lib/auth";
import { recordLog } from "@/lib/audit";
import { goalSchema } from "@/lib/validation";
import { createInAppNotification } from "@/services/notifications";
import type { ActionState } from "./auth.actions";

export interface GoalListItem {
  id: string;
  title: string;
  description: string;
  reward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  completedCount: number;
  completedByMe?: boolean;
}

export async function listGoals(): Promise<GoalListItem[]> {
  const session = await requireSession();
  await connectToDatabase();

  const goals = await Goal.find().sort({ createdAt: -1 }).lean();
  return goals.map((g) => ({
    id: g._id.toString(),
    title: g.title,
    description: g.description,
    reward: g.reward,
    startDate: g.startDate.toISOString(),
    endDate: g.endDate.toISOString(),
    isActive: g.isActive,
    completedCount: g.completedBy?.length || 0,
    completedByMe: g.completedBy?.some((id) => id.toString() === session.userId),
  }));
}

export async function createGoalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    reward: Number(formData.get("reward")),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os campos da meta." };
  }

  const goal = await Goal.create({
    ...parsed.data,
    startDate: new Date(parsed.data.startDate),
    endDate: new Date(parsed.data.endDate),
  });

  await recordLog({
    actor: admin.userId,
    action: "goal.create",
    targetType: "Goal",
    targetId: goal._id.toString(),
  });

  revalidatePath("/admin/goals");
  revalidatePath("/dashboard");
  return { success: true, message: "Meta criada com sucesso." };
}

export async function updateGoalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const id = String(formData.get("id") || "");
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    reward: Number(formData.get("reward")),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os campos da meta." };
  }

  await Goal.findByIdAndUpdate(id, {
    ...parsed.data,
    startDate: new Date(parsed.data.startDate),
    endDate: new Date(parsed.data.endDate),
  });

  await recordLog({
    actor: admin.userId,
    action: "goal.update",
    targetType: "Goal",
    targetId: id,
  });

  revalidatePath("/admin/goals");
  return { success: true, message: "Meta atualizada." };
}

export async function deleteGoalAction(id: string): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  await Goal.findByIdAndDelete(id);

  await recordLog({
    actor: admin.userId,
    action: "goal.delete",
    targetType: "Goal",
    targetId: id,
  });

  revalidatePath("/admin/goals");
  return { success: true, message: "Meta excluída." };
}

export async function toggleGoalActiveAction(id: string): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const goal = await Goal.findById(id);
  if (!goal) return { success: false, message: "Meta não encontrada." };

  goal.isActive = !goal.isActive;
  await goal.save();

  revalidatePath("/admin/goals");
  return { success: true };
}

/**
 * Marca uma meta como concluída para um participante específico e credita
 * as Sakalekas correspondentes. Chamado pelo administrador ao validar a
 * conclusão de uma meta por um participante.
 */
export async function markGoalCompletedForUserAction(
  goalId: string,
  userId: string
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const goal = await Goal.findById(goalId);
  const user = await User.findById(userId);
  if (!goal || !user) return { success: false, message: "Meta ou usuário não encontrado." };

  if (goal.completedBy.some((id) => id.toString() === userId)) {
    return { success: false, message: "Este participante já concluiu esta meta." };
  }

  goal.completedBy.push(user._id);
  await goal.save();

  user.balance += goal.reward;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "credit",
    source: "goal_completed",
    amount: goal.reward,
    balanceAfter: user.balance,
    note: `Meta concluída: ${goal.title}`,
    performedBy: admin.userId,
    relatedGoal: goal._id,
  });

  await createInAppNotification(
    user._id.toString(),
    "Meta concluída! 🎯",
    `Você concluiu "${goal.title}" e recebeu ${goal.reward} Sakalekas.`
  );

  await recordLog({
    actor: admin.userId,
    action: "goal.mark_completed",
    targetType: "Goal",
    targetId: goalId,
    details: { userId },
  });

  revalidatePath("/admin/goals");
  revalidatePath("/dashboard");
  return { success: true, message: "Meta marcada como concluída e Sakalekas creditadas." };
}
