"use client";

import { useRouter } from "next/navigation";
import { LogOut, Coins } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth.actions";
import { formatSakalekas } from "@/lib/utils";

export function Topbar({
  name,
  role,
  balance,
  title,
}: {
  name: string;
  role: "admin" | "participant";
  balance?: number;
  title?: string;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-8 h-16 border-b border-white/5 bg-sakaland-black/80 backdrop-blur">
      <div>
        {title && <h1 className="font-display text-xl">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {role === "participant" && typeof balance === "number" && (
          <div className="flex items-center gap-2 bg-gradient-to-b from-sakaland-surface2 to-sakaland-surface border border-sakaland-gold/40 rounded-full pl-1.5 pr-3.5 py-1.5 shadow-[0_1px_0_0_rgba(241,231,211,0.05)_inset]">
            <span className="w-6 h-6 rounded-full bg-sakaland-gold/15 border border-sakaland-gold/40 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-sakaland-gold" />
            </span>
            <span className="font-numeric text-sm font-medium text-sakaland-white">
              {formatSakalekas(balance)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-sakaland-muted hidden sm:inline">
              Sakalekas
            </span>
          </div>
        )}

        <ThemeToggle />

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-sakaland-surface2 flex items-center justify-center text-xs font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{name}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Sair"
          onClick={async () => {
            await logoutAction();
            router.push("/login");
            router.refresh();
          }}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
