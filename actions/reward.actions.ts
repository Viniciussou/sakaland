"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { Reward } from "@/models";
import { requireAdmin } from "@/lib/auth";
import { recordLog } from "@/lib/audit";
import { rewardSchema } from "@/lib/validation";
import type { ActionState } from "./auth.actions";

export interface RewardListItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  stock: number;
  price: number;
  category: string;
  featured: boolean;
  isActive: boolean;
}

export async function listRewards(onlyActive = false): Promise<RewardListItem[]> {
  await connectToDatabase();
  const filter = onlyActive ? { isActive: true } : {};
  const rewards = await Reward.find(filter).sort({ featured: -1, createdAt: -1 }).lean();
  return rewards.map((r) => ({
    id: r._id.toString(),
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    stock: r.stock,
    price: r.price,
    category: r.category,
    featured: r.featured,
    isActive: r.isActive,
  }));
}

export async function createRewardAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const parsed = rewardSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    stock: Number(formData.get("stock")),
    price: Number(formData.get("price")),
    category: formData.get("category"),
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os campos do brinde." };
  }

  const reward = await Reward.create(parsed.data);

  await recordLog({
    actor: admin.userId,
    action: "reward.create",
    targetType: "Reward",
    targetId: reward._id.toString(),
  });

  revalidatePath("/admin/store");
  revalidatePath("/store");
  return { success: true, message: "Brinde adicionado à loja." };
}

export async function updateRewardAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const id = String(formData.get("id") || "");
  const parsed = rewardSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    stock: Number(formData.get("stock")),
    price: Number(formData.get("price")),
    category: formData.get("category"),
    featured: formData.get("featured") === "on",
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os campos do brinde." };
  }

  await Reward.findByIdAndUpdate(id, parsed.data);

  await recordLog({
    actor: admin.userId,
    action: "reward.update",
    targetType: "Reward",
    targetId: id,
  });

  revalidatePath("/admin/store");
  revalidatePath("/store");
  return { success: true, message: "Brinde atualizado." };
}

export async function deleteRewardAction(id: string): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  await Reward.findByIdAndDelete(id);

  await recordLog({
    actor: admin.userId,
    action: "reward.delete",
    targetType: "Reward",
    targetId: id,
  });

  revalidatePath("/admin/store");
  revalidatePath("/store");
  return { success: true, message: "Brinde removido." };
}
