"use server";

import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import { User, Setting } from "@/models";
import {
  hashPassword,
  comparePassword,
  signSessionToken,
  signResetToken,
  verifyResetToken,
  SESSION_COOKIE_NAME,
  getSession,
} from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validation";
import { recordLog } from "@/lib/audit";
import { sendEmail } from "@/services/notifications";

export interface ActionState {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    department: formData.get("department") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) {
    return {
      success: false,
      fieldErrors: { email: "Este e-mail já está cadastrado." },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const isFirstUser = (await User.countDocuments()) === 0;

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    department: parsed.data.department,
    role: isFirstUser ? "admin" : "participant", // primeiro cadastro vira admin
  });

  await recordLog({
    actor: user._id.toString(),
    action: "user.register",
    targetType: "User",
    targetId: user._id.toString(),
  });

  const token = signSessionToken({
    userId: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, message: "Verifique os dados informados." };
  }

  await connectToDatabase();

  const user = await User.findOne({ email: parsed.data.email });
  if (!user) {
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  if (user.isBlocked) {
    return {
      success: false,
      message: "Sua conta está bloqueada. Fale com um administrador.",
    };
  }

  const valid = await comparePassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  const token = signSessionToken({
    userId: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  await recordLog({
    actor: user._id.toString(),
    action: "user.login",
    targetType: "User",
    targetId: user._id.toString(),
  });

  return { success: true };
}

export async function logoutAction() {
  const session = await getSession();
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  if (session) {
    await recordLog({
      actor: session.userId,
      action: "user.logout",
      targetType: "User",
      targetId: session.userId,
    });
  }
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { success: false, message: "E-mail inválido." };
  }

  await connectToDatabase();
  const user = await User.findOne({ email: parsed.data.email });

  // Não revelamos se o e-mail existe ou não (evita enumeração de usuários)
  if (user) {
    const token = signResetToken(user._id.toString());
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await sendEmail(
      [user.email],
      "Redefinição de senha — Sakaland",
      `<div style="font-family:sans-serif;background:#0B0B0D;color:#F5F5F0;padding:24px;">
        <h2 style="color:#C8102E;">Redefinir senha</h2>
        <p>Recebemos uma solicitação para redefinir sua senha no Sakaland.</p>
        <p><a href="${resetLink}" style="color:#C8102E;">Clique aqui para criar uma nova senha</a></p>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      </div>`
    );

    await recordLog({
      actor: user._id.toString(),
      action: "user.forgot_password",
      targetType: "User",
      targetId: user._id.toString(),
    });
  }

  return {
    success: true,
    message: "Se o e-mail existir em nossa base, você receberá instruções.",
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  const payload = verifyResetToken(parsed.data.token);
  if (!payload) {
    return {
      success: false,
      message: "Link expirado ou inválido. Solicite um novo.",
    };
  }

  await connectToDatabase();
  const user = await User.findById(payload.userId);
  if (!user) {
    return { success: false, message: "Usuário não encontrado." };
  }

  user.passwordHash = await hashPassword(parsed.data.password);
  await user.save();

  await recordLog({
    actor: user._id.toString(),
    action: "user.reset_password",
    targetType: "User",
    targetId: user._id.toString(),
  });

  return { success: true, message: "Senha redefinida com sucesso!" };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Não autenticado." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { success: false, message: "Verifique os campos." };
  }

  await connectToDatabase();
  const user = await User.findById(session.userId);
  if (!user) return { success: false, message: "Usuário não encontrado." };

  const valid = await comparePassword(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) {
    return { success: false, message: "Senha atual incorreta." };
  }

  user.passwordHash = await hashPassword(parsed.data.newPassword);
  await user.save();

  await recordLog({
    actor: user._id.toString(),
    action: "user.change_password",
    targetType: "User",
    targetId: user._id.toString(),
  });

  return { success: true, message: "Senha alterada com sucesso!" };
}
