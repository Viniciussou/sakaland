"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { User, Transaction } from "@/models";
import { requireAdmin } from "@/lib/auth";
import { recordLog } from "@/lib/audit";
import { grantSakalekasSchema, bulkDistributionSchema } from "@/lib/validation";
import { createInAppNotification } from "@/services/notifications";
import type { ActionState } from "./auth.actions";

export interface TransactionListItem {
  id: string;
  userName: string;
  userEmail: string;
  type: "credit" | "debit";
  source: string;
  amount: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
}

export async function listTransactions(limit = 50): Promise<TransactionListItem[]> {
  await requireAdmin();
  await connectToDatabase();

  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name email")
    .lean();

  return transactions.map((t) => ({
    id: t._id.toString(),
    userName: (t.user as any)?.name || "Usuário removido",
    userEmail: (t.user as any)?.email || "",
    type: t.type,
    source: t.source,
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
  }));
}

const TX_PAGE_SIZE = 20;

export interface PaginatedTransactions {
  transactions: TransactionListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listTransactionsPaginated(page = 1): Promise<PaginatedTransactions> {
  await requireAdmin();
  await connectToDatabase();

  const safePage = Math.max(1, page);
  const [transactions, total] = await Promise.all([
    Transaction.find()
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * TX_PAGE_SIZE)
      .limit(TX_PAGE_SIZE)
      .populate("user", "name email")
      .lean(),
    Transaction.countDocuments(),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t._id.toString(),
      userName: (t.user as any)?.name || "Usuário removido",
      userEmail: (t.user as any)?.email || "",
      type: t.type,
      source: t.source,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / TX_PAGE_SIZE)),
  };
}

export async function grantSakalekasAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const parsed = grantSakalekasSchema.safeParse({
    userId: formData.get("userId"),
    amount: Number(formData.get("amount")),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os dados informados." };
  }

  const user = await User.findById(parsed.data.userId);
  if (!user) return { success: false, message: "Usuário não encontrado." };

  user.balance += parsed.data.amount;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "credit",
    source: "admin_grant",
    amount: parsed.data.amount,
    balanceAfter: user.balance,
    note: parsed.data.note,
    performedBy: admin.userId,
  });

  await createInAppNotification(
    user._id.toString(),
    "Você recebeu Sakalekas! 🪙",
    `${parsed.data.amount} Sakalekas foram creditadas na sua conta.${
      parsed.data.note ? ` Motivo: ${parsed.data.note}` : ""
    }`
  );

  await recordLog({
    actor: admin.userId,
    action: "sakalekas.grant",
    targetType: "User",
    targetId: user._id.toString(),
    details: { amount: parsed.data.amount, note: parsed.data.note },
  });

  revalidatePath("/admin/sakalekas");
  revalidatePath("/admin/users");
  return { success: true, message: "Sakalekas concedidas com sucesso." };
}

export async function revokeSakalekasAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const parsed = grantSakalekasSchema.safeParse({
    userId: formData.get("userId"),
    amount: Number(formData.get("amount")),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os dados informados." };
  }

  const user = await User.findById(parsed.data.userId);
  if (!user) return { success: false, message: "Usuário não encontrado." };

  user.balance = Math.max(0, user.balance - parsed.data.amount);
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "debit",
    source: "admin_revoke",
    amount: parsed.data.amount,
    balanceAfter: user.balance,
    note: parsed.data.note,
    performedBy: admin.userId,
  });

  await recordLog({
    actor: admin.userId,
    action: "sakalekas.revoke",
    targetType: "User",
    targetId: user._id.toString(),
    details: { amount: parsed.data.amount, note: parsed.data.note },
  });

  revalidatePath("/admin/sakalekas");
  revalidatePath("/admin/users");
  return { success: true, message: "Sakalekas removidas com sucesso." };
}

export async function bulkDistributionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const userIds = String(formData.get("userIds") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = bulkDistributionSchema.safeParse({
    userIds,
    amount: Number(formData.get("amount")),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { success: false, message: "Selecione ao menos um participante e um valor válido." };
  }

  const users = await User.find({ _id: { $in: parsed.data.userIds } });

  for (const user of users) {
    user.balance += parsed.data.amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: "credit",
      source: "bulk_distribution",
      amount: parsed.data.amount,
      balanceAfter: user.balance,
      note: parsed.data.note,
      performedBy: admin.userId,
    });

    await createInAppNotification(
      user._id.toString(),
      "Você recebeu Sakalekas! 🪙",
      `${parsed.data.amount} Sakalekas foram distribuídas para você em uma ação em massa.`
    );
  }

  await recordLog({
    actor: admin.userId,
    action: "sakalekas.bulk_distribution",
    details: { count: users.length, amount: parsed.data.amount },
  });

  revalidatePath("/admin/sakalekas");
  revalidatePath("/admin/users");
  return {
    success: true,
    message: `Sakalekas distribuídas para ${users.length} participante(s).`,
  };
}
