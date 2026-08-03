import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET as string;

export const SESSION_COOKIE_NAME = "sakaland_session";

export interface SessionPayload {
  userId: string;
  role: "admin" | "participant";
  name: string;
  email: string;
}

// ---------- Senhas ----------

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------- Tokens de sessão (JWT) ----------

export function signSessionToken(payload: SessionPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET não configurado");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!JWT_SECRET) throw new Error("JWT_SECRET não configurado");
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

// ---------- Tokens de reset de senha (curta duração, secret separado) ----------

export function signResetToken(userId: string): string {
  if (!JWT_RESET_SECRET) throw new Error("JWT_RESET_SECRET não configurado");
  return jwt.sign({ userId }, JWT_RESET_SECRET, { expiresIn: "1h" });
}

export function verifyResetToken(token: string): { userId: string } | null {
  try {
    if (!JWT_RESET_SECRET) throw new Error("JWT_RESET_SECRET não configurado");
    return jwt.verify(token, JWT_RESET_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// ---------- Sessão via cookies (Server Components / Server Actions) ----------

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("FORBIDDEN");
  return session;
}
