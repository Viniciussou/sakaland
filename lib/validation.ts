import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
});

// Upload de foto de perfil: a imagem é convertida para base64 e salva
// diretamente no documento do usuário no MongoDB (campo avatarUrl).
export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const rewardSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  imageUrl: z.string().url(),
  stock: z.number().int().min(0),
  price: z.number().min(0),
  category: z.string().min(1),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const goalSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  reward: z.number().min(0),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().optional(),
});

export const grantSakalekasSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  note: z.string().optional(),
});

export const bulkDistributionSchema = z.object({
  userIds: z.array(z.string()).min(1),
  amount: z.number().positive(),
  note: z.string().optional(),
});
