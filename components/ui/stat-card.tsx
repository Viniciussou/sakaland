import { LucideIcon } from "lucide-react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "white";
  hint?: string;
}) {
  const accentColor = {
    primary: "text-sakaland-primary bg-sakaland-primary/10 border-sakaland-primary/20",
    accent: "text-sakaland-accent bg-sakaland-accent/10 border-sakaland-accent/20",
    white: "text-sakaland-white bg-white/10 border-white/15",
  }[accent];

  const barColor = {
    primary: "bg-sakaland-primary",
    accent: "bg-sakaland-accent",
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
