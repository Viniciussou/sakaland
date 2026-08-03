import { getRanking } from "@/actions/dashboard.actions";
import { Card } from "@/components/ui/card";
import { MedalBadge } from "@/components/ui/medal-badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatSakalekas, cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

export default async function RankingPage() {
  const { top10, me } = await getRanking();
  const meInTop10 = top10.some((p) => me && p.id === me.id);

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <PageHeader
        eyebrow="Classificação geral"
        title="Ranking Sakaland"
        description="Os participantes com mais Sakalekas acumuladas no evento."
        actions={
          <span className="w-11 h-11 rounded-full bg-sakaland-gold/10 border border-sakaland-gold/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-sakaland-gold" />
          </span>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-white/5">
          {top10.map((p) => {
            const isMe = me?.id === p.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 transition-colors",
                  isMe && "bg-sakaland-red/10"
                )}
              >
                <MedalBadge position={p.position} />
                <div className="w-9 h-9 rounded-full bg-sakaland-surface2 flex items-center justify-center text-sm font-semibold shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("truncate", isMe && "font-semibold text-sakaland-red")}>
                    {p.name} {isMe && "(você)"}
                  </p>
                  {p.department && (
                    <p className="text-xs text-sakaland-muted truncate">{p.department}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-numeric text-lg text-sakaland-gold shrink-0">
                  {formatSakalekas(p.balance)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {me && !meInTop10 && (
        <Card className="border-sakaland-red/40">
          <p className="text-xs uppercase tracking-wider text-sakaland-muted mb-3">
            Sua posição
          </p>
          <div className="flex items-center gap-4">
            <MedalBadge position={me.position} />
            <div className="w-9 h-9 rounded-full bg-sakaland-surface2 flex items-center justify-center text-sm font-semibold">
              {me.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sakaland-red">{me.name} (você)</p>
            </div>
            <div className="font-numeric text-lg text-sakaland-gold">
              {formatSakalekas(me.balance)}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
