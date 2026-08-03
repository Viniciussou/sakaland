import { LucideIcon } from "lucide-react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "red",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "red" | "gold" | "white";
  hint?: string;
}) {
  const accentColor = {
    red: "text-sakaland-red bg-sakaland-red/10 border-sakaland-red/20",
    gold: "text-sakaland-gold bg-sakaland-gold/10 border-sakaland-gold/20",
    white: "text-sakaland-white bg-white/10 border-white/15",
  }[accent];

  const barColor = {
    red: "bg-sakaland-red",
    gold: "bg-sakaland-gold",
    white: "bg-sakaland-white/60",
  }[accent];

  return (
    <Card className="relative overflow-hidden flex items-start justify-between card-glow stamp-corner">
      <span className={cn("absolute left-0 top-0 bottom-0 w-[3px]", barColor)} />
      <div className="pl-2">
        <p className="text-[11px] uppercase tracking-[0.15em] text-sakaland-muted mb-2">
          {label}
        </p>
        <p className="font-numeric text-3xl font-medium text-sakaland-white">{value}</p>
        {hint && <p className="text-xs text-sakaland-muted mt-1.5">{hint}</p>}
      </div>
      <div className={cn("p-2.5 rounded-lg border", accentColor)}>
        <Icon className="w-5 h-5" />
      </div>
    </Card>
  );
}
