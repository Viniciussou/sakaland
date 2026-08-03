import { cn } from "@/lib/utils";

const medalStyles: Record<string, string> = {
  gold: "bg-sakaland-gold/15 text-sakaland-gold border-sakaland-gold/50 shadow-[0_0_0_3px_rgba(182,137,63,0.12)]",
  silver: "bg-sakaland-silver/15 text-sakaland-silver border-sakaland-silver/50 shadow-[0_0_0_3px_rgba(182,172,152,0.10)]",
  bronze: "bg-sakaland-bronze/15 text-sakaland-bronze border-sakaland-bronze/50 shadow-[0_0_0_3px_rgba(147,103,63,0.10)]",
};

export function MedalBadge({ position }: { position: number }) {
  const medal =
    position === 1 ? "gold" : position === 2 ? "silver" : position === 3 ? "bronze" : null;

  if (!medal) {
    return (
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 font-numeric text-xs text-sakaland-muted">
        {position}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative w-8 h-8 flex items-center justify-center rounded-full border-2 font-numeric text-xs font-semibold",
        medalStyles[medal]
      )}
    >
      {position}
    </span>
  );
}
