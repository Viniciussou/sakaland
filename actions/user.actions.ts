"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { User, Transaction } from "@/models";
import { requireAdmin, requireSession, hashPassword } from "@/lib/auth";
import { recordLog } from "@/lib/audit";
import { updateProfileSchema } from "@/lib/validation";
import type { ActionState } from "./auth.actions";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "participant";
  department?: string;
  balance: number;
  isBlocked: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export async function listUsers(query?: string): Promise<UserListItem[]> {
  await requireAdmin();
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).lean();
  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    balance: u.balance,
    isBlocked: u.isBlocked,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt.toISOString(),
  }));
}

export interface PaginatedUsers {
  users: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

const PAGE_SIZE = 15;

export async function listUsersPaginated(
  query?: string,
  page = 1
): Promise<PaginatedUsers> {
  await requireAdmin();
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  const safePage = Math.max(1, page);
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      balance: u.balance,
      isBlocked: u.isBlocked,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function createUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = (formData.get("role") as "admin" | "participant") || "participant";
  const department = String(formData.get("department") || "");

  if (!name || !email || password.length < 8) {
    return { success: false, message: "Preencha todos os campos corretamente." };
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return { success: false, message: "Já existe um usuário com este e-mail." };
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role,
    department,
  });

  await recordLog({
    actor: admin.userId,
    action: "user.create_by_admin",
    targetType: "User",
    targetId: user._id.toString(),
    details: { role },
  });

  revalidatePath("/admin/users");
  return { success: true, message: "Usuário criado com sucesso." };
}

export async function updateUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = formData.get("role") as "admin" | "participant";
  const department = String(formData.get("department") || "");

  const user = await User.findById(id);
  if (!user) return { success: false, message: "Usuário não encontrado." };

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  user.department = department;
  await user.save();

  await recordLog({
    actor: admin.userId,
    action: "user.update",
    targetType: "User",
    targetId: id,
  });

  revalidatePath("/admin/users");
  return { success: true, message: "Usuário atualizado." };
}

export async function deleteUserAction(id: string): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  await User.findByIdAndDelete(id);

  await recordLog({
    actor: admin.userId,
    action: "user.delete",
    targetType: "User",
    targetId: id,
  });

  revalidatePath("/admin/users");
  return { success: true, message: "Usuário excluído." };
}

export async function toggleBlockUserAction(id: string): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const user = await User.findById(id);
  if (!user) return { success: false, message: "Usuário não encontrado." };

  user.isBlocked = !user.isBlocked;
  await user.save();

  await recordLog({
    actor: admin.userId,
    action: user.isBlocked ? "user.block" : "user.unblock",
    targetType: "User",
    targetId: id,
  });

  revalidatePath("/admin/users");
  return { success: true, message: user.isBlocked ? "Usuário bloqueado." : "Usuário desbloqueado." };
}

export async function resetUserPasswordAction(
  id: string,
  newPassword: string
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  if (newPassword.length < 8) {
    return { success: false, message: "A senha deve ter no mínimo 8 caracteres." };
  }

  const user = await User.findById(id);
  if (!user) return { success: false, message: "Usuário não encontrado." };

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await recordLog({
    actor: admin.userId,
    action: "user.admin_reset_password",
    targetType: "User",
    targetId: id,
  });

  return { success: true, message: "Senha redefinida com sucesso." };
}

export async function setUserPermissionsAction(
  id: string,
  permissions: string[]
): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  await User.findByIdAndUpdate(id, { permissions });

  await recordLog({
    actor: admin.userId,
    action: "user.set_permissions",
    targetType: "User",
    targetId: id,
    details: { permissions },
  });

  revalidatePath("/admin/users");
  return { success: true, message: "Permissões atualizadas." };
}

// ---------- Perfil do usuário logado ----------

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  await connectToDatabase();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name") || undefined,
    department: formData.get("department") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os campos informados." };
  }

  const user = await User.findById(session.userId);
  if (!user) return { success: false, message: "Usuário não encontrado." };

  if (parsed.data.name) user.name = parsed.data.name;
  if (parsed.data.department !== undefined) user.department = parsed.data.department;
  if (parsed.data.avatarUrl) user.avatarUrl = parsed.data.avatarUrl;

  await user.save();

  await recordLog({
    actor: session.userId,
    action: "user.update_profile",
    targetType: "User",
    targetId: session.userId,
  });

  revalidatePath("/profile");
  return { success: true, message: "Perfil atualizado com sucesso." };
}

export async function getMyActivity() {
  const session = await requireSession();
  await connectToDatabase();

  const transactions = await Transaction.find({ user: session.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return transactions.map((t) => ({
    id: t._id.toString(),
    type: t.type,
    source: t.source,
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
  }));
}
