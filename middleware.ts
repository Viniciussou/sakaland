import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "sakaland_session";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const ADMIN_PREFIX = "/admin";
const PARTICIPANT_PREFIXES = ["/dashboard", "/store", "/ranking", "/profile"];

async function getSessionFromCookie(token: string | undefined) {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: "admin" | "participant" };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Não intercepta assets estáticos e rotas de API de autenticação
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSessionFromCookie(token);

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Usuário não autenticado tentando acessar rota protegida
  if (!session && !isPublicPath && pathname !== "/") {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Usuário autenticado tentando acessar telas de auth -> manda pro dashboard certo
  if (session && isPublicPath) {
    const url = new URL(
      session.role === "admin" ? "/admin/dashboard" : "/dashboard",
      request.url
    );
    return NextResponse.redirect(url);
  }

  // RBAC: participante tentando acessar área administrativa
  if (session && pathname.startsWith(ADMIN_PREFIX) && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // RBAC: admin acessando rotas específicas de participante -> permitido navegar,
  // mas por padrão redirecionamos para o painel admin para manter fluxo claro
  if (
    session &&
    session.role === "admin" &&
    PARTICIPANT_PREFIXES.some((p) => pathname.startsWith(p)) &&
    !pathname.startsWith("/profile")
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
