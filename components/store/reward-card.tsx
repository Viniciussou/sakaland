"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSakalekas, cn } from "@/lib/utils";
import { purchaseRewardAction } from "@/actions/purchase.actions";
import type { RewardListItem } from "@/actions/reward.actions";

export function RewardCard({
  reward,
  balance,
}: {
  reward: RewardListItem;
  balance: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [stock, setStock] = useState(reward.stock);
  const soldOut = stock <= 0;
  const canAfford = balance >= reward.price;

  function handlePurchase() {
    startTransition(async () => {
      const result = await purchaseRewardAction(reward.id);
      if (result.success) {
        toast.success(result.message);
        setStock((s) => Math.max(0, s - 1));
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card className="p-0 overflow-hidden flex flex-col group">
      <div className="relative aspect-[4/3] bg-sakaland-surface2 overflow-hidden">
        <Image
          src={reward.imageUrl}
          alt={reward.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 300px"
        />
        {reward.featured && (
          <Badge className="absolute top-3 left-3" variant="warning">
            Destaque
          </Badge>
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-sakaland-black/70 flex items-center justify-center">
            <span className="animate-stamp inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-[3px] border-double border-sakaland-red text-sakaland-red rotate-[-10deg]">
              <span className="font-display text-[13px] tracking-[0.15em] leading-none">ESGOTADO</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-wider text-sakaland-muted mb-1">
          {reward.category}
        </p>
        <h3 className="font-display text-lg leading-tight mb-1">{reward.name}</h3>
        <p className="text-sm text-sakaland-muted line-clamp-2 flex-1">
          {reward.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-sakaland-gold font-medium font-numeric">
            <Coins className="w-4 h-4" />
            {formatSakalekas(reward.price)}
          </div>
          <span className="text-xs text-sakaland-muted font-numeric">
            {stock} restante{stock === 1 ? "" : "s"}
          </span>
        </div>

        <Button
          className="w-full mt-3"
          disabled={soldOut || isPending || !canAfford}
          onClick={handlePurchase}
          variant={soldOut ? "secondary" : "primary"}
        >
          {soldOut
            ? "Esgotado"
            : isPending
            ? "Processando..."
            : !canAfford
            ? "Saldo insuficiente"
            : "Comprar"}
        </Button>
      </div>
    </Card>
  );
}
