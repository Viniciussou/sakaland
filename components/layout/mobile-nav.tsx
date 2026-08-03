"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Coins,
  Target,
  Gift,
  Trophy,
  ShoppingBag,
  UserCircle,
} from "lucide-react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/sakalekas", label: "Moedas", icon: Coins },
  { href: "/admin/goals", label: "Metas", icon: Target },
  { href: "/admin/store", label: "Loja", icon: Gift },
];

const participantLinks = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/store", label: "Loja", icon: ShoppingBag },
  { href: "/profile", label: "Perfil", icon: UserCircle },
];

export function MobileNav({ role }: { role: "admin" | "participant" }) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : participantLinks;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-sakaland-black/95 backdrop-blur border-t border-white/10 flex justify-around py-2">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 text-[10px]",
              active ? "text-sakaland-red" : "text-sakaland-muted"
            )}
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
