"use client";

import { useMemo, useState } from "react";
import { RewardCard } from "./reward-card";
import { cn } from "@/lib/utils";
import type { RewardListItem } from "@/actions/reward.actions";

export function StoreGrid({
  rewards,
  balance,
}: {
  rewards: RewardListItem[];
  balance: number;
}) {
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(rewards.map((r) => r.category)))],
    [rewards]
  );
  const [active, setActive] = useState("Todos");

  const filtered = active === "Todos" ? rewards : rewards.filter((r) => r.category === active);

  return (
    <div className="space-y-5">
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
                active === cat
                  ? "bg-sakaland-primary border-sakaland-primary text-white"
                  : "bg-sakaland-surface border-white/10 text-sakaland-muted hover:text-sakaland-white hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((reward) => (
          <RewardCard key={reward.id} reward={reward} balance={balance} />
        ))}
      </div>
    </div>
  );
}
