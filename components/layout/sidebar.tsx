"use client";

import { Logo } from "@/components/brand/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Coins,
  Target,
  Gift,
  FileBarChart,
  Settings,
  ScrollText,
  Trophy,
  ShoppingBag,
  UserCircle,
} from "lucide-react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/sakalekas", label: "Sakalekas", icon: Coins },
  { href: "/admin/goals", label: "Metas", icon: Target },
  { href: "/admin/store", label: "Loja", icon: Gift },
  { href: "/admin/reports", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

const participantLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/store", label: "Loja", icon: ShoppingBag },
  { href: "/profile", label: "Meu perfil", icon: UserCircle },
];

export function Sidebar({ role }: { role: "admin" | "participant" }) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : participantLinks;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/5 bg-sakaland-black relative h-screen sticky top-0 py-7">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-sakaland-primary via-sakaland-primary/40 to-transparent" />

      <div className="px-6 flex items-center gap-3 mb-9">
        <Logo height={26} />
        <div className="text-[10px] uppercase tracking-[0.2em] text-sakaland-muted leading-tight">
          {role === "admin" ? "Painel administrativo" : "Área do participante"}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                active
                  ? "bg-sakaland-primary/12 text-sakaland-white border border-sakaland-primary/25"
                  : "text-sakaland-muted hover:text-sakaland-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  active ? "text-sakaland-primary" : "text-sakaland-muted group-hover:text-sakaland-white"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-6 pt-5 mt-2 border-t border-white/5 text-[11px] text-sakaland-muted flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-sakaland-primary" />
        Sakamoto · {new Date().getFullYear()}
      </div>
    </aside>
  );
}
