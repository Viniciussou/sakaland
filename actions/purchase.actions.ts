"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Reward, User, Transaction, Purchase } from "@/models";
import { requireSession, requireAdmin } from "@/lib/auth";
import { recordLog } from "@/lib/audit";
import { notifyAdminsOfPurchase } from "@/services/notifications";
import type { ActionState } from "./auth.actions";

/**
 * Fluxo de compra de um brinde pelo participante:
 * 1. Verifica saldo suficiente.
 * 2. Verifica estoque disponível.
 * 3. Deduz o saldo, registra a transação e a compra, atualiza o estoque.
 * 4. Notifica administradores por e-mail e WhatsApp.
 */
export async function purchaseRewardAction(rewardId: string): Promise<ActionState> {
  const session = await requireSession();
  await connectToDatabase();

  const [reward, user] = await Promise.all([
    Reward.findById(rewardId),
    User.findById(session.userId),
  ]);

  if (!reward || !reward.isActive) {
    return { success: false, message: "Este brinde não está disponível." };
  }
  if (!user) {
    return { success: false, message: "Usuário não encontrado." };
  }
  if (reward.stock <= 0) {
    return { success: false, message: "Este item está esgotado." };
  }
  if (user.balance < reward.price) {
    return { success: false, message: "Você não possui Sakalekas suficientes." };
  }

  // Deduz saldo e estoque
  user.balance -= reward.price;
  reward.stock -= 1;
  await Promise.all([user.save(), reward.save()]);

  const purchase = await Purchase.create({
    user: user._id,
    reward: reward._id,
    rewardNameSnapshot: reward.name,
    priceSnapshot: reward.price,
    status: "pending",
  });

  await Transaction.create({
    user: user._id,
    type: "debit",
    source: "purchase",
    amount: reward.price,
    balanceAfter: user.balance,
    note: `Resgate: ${reward.name}`,
    relatedPurchase: purchase._id,
  });

  await recordLog({
    actor: user._id.toString(),
    action: "reward.purchase",
    targetType: "Reward",
    targetId: reward._id.toString(),
    details: { price: reward.price },
  });

  // Notificações para administradores (e-mail + WhatsApp + in-app) — não bloqueia a resposta ao usuário
  notifyAdminsOfPurchase({
    participantName: user.name,
    rewardName: reward.name,
    price: reward.price,
  }).catch((err) => console.error("[purchase] falha ao notificar admins:", err));

  revalidatePath("/store");
  revalidatePath("/dashboard");
  revalidatePath("/admin/store");

  return { success: true, message: `Resgate de "${reward.name}" confirmado!` };
}

export interface PurchaseListItem {
  id: string;
  userName: string;
  userEmail: string;
  rewardName: string;
  price: number;
  status: "pending" | "delivered" | "cancelled";
  createdAt: string;
}

export async function listAllPurchases(): Promise<PurchaseListItem[]> {
  await requireAdmin();
  await connectToDatabase();

  const purchases = await Purchase.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .lean();

  return purchases.map((p) => ({
    id: p._id.toString(),
    userName: (p.user as any)?.name || "Usuário removido",
    userEmail: (p.user as any)?.email || "",
    rewardName: p.rewardNameSnapshot,
    price: p.priceSnapshot,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));
}

const PURCHASE_PAGE_SIZE = 15;

export interface PaginatedPurchases {
  purchases: PurchaseListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listAllPurchasesPaginated(page = 1): Promise<PaginatedPurchases> {
  await requireAdmin();
  await connectToDatabase();

  const safePage = Math.max(1, page);
  const [purchases, total] = await Promise.all([
    Purchase.find()
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * PURCHASE_PAGE_SIZE)
      .limit(PURCHASE_PAGE_SIZE)
      .populate("user", "name email")
      .lean(),
    Purchase.countDocuments(),
  ]);

  return {
    purchases: purchases.map((p) => ({
      id: p._id.toString(),
      userName: (p.user as any)?.name || "Usuário removido",
      userEmail: (p.user as any)?.email || "",
      rewardName: p.rewardNameSnapshot,
      price: p.priceSnapshot,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / PURCHASE_PAGE_SIZE)),
  };
}

export async function updatePurchaseStatusAction(
  id: string,
  status: "pending" | "delivered" | "cancelled"
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  await Purchase.findByIdAndUpdate(id, { status });

  await recordLog({
    actor: admin.userId,
    action: "purchase.update_status",
    targetType: "Purchase",
    targetId: id,
    details: { status },
  });

  revalidatePath("/admin/store");
  return { success: true, message: "Status atualizado." };
}

export async function listMyPurchases(): Promise<PurchaseListItem[]> {
  const session = await requireSession();
  await connectToDatabase();

  const purchases = await Purchase.find({ user: session.userId })
    .sort({ createdAt: -1 })
    .lean();

  return purchases.map((p) => ({
    id: p._id.toString(),
    userName: session.name,
    userEmail: session.email,
    rewardName: p.rewardNameSnapshot,
    price: p.priceSnapshot,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));
}
