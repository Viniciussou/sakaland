import { getParticipantDashboard } from "@/actions/dashboard.actions";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatSakalekas, formatDate, cn } from "@/lib/utils";
import { Coins, Target, Trophy, History, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function ParticipantDashboardPage() {
  const data = await getParticipantDashboard();
  const firstName = data.name.split(" ")[0];

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        eyebrow="Sua jornada no evento"
        title={`Olá, ${firstName}!`}
        description="Acompanhe seu saldo, suas metas e sua posição no ranking do Sakaland."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Saldo atual"
          value={`${formatSakalekas(data.balance)}`}
          hint="Sakalekas disponíveis"
          icon={Coins}
          accent="accent"
        />
        <StatCard
          label="Sua posição"
          value={`#${data.rankPosition}`}
          hint="no ranking geral"
          icon={Trophy}
          accent="primary"
        />
        <StatCard
          label="Metas concluídas"
          value={data.completedGoalsCount}
          hint="parabéns pelo empenho!"
          icon={CheckCircle2}
          accent="white"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg flex items-center gap-2">
              <Target className="w-4 h-4 text-sakaland-primary" /> Metas disponíveis
            </h2>
          </div>

          {data.activeGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Nenhuma meta ativa no momento"
              description="Novas metas aparecerão aqui assim que forem publicadas pela organização."
            />
          ) : (
            <div className="space-y-3">
              {data.activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg bg-sakaland-surface2 border border-white/5"
                >
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-sakaland-muted mt-0.5">
                      {goal.description}
                    </p>
                    <p className="text-xs text-sakaland-muted mt-2">
                      Válida até {formatDate(goal.endDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sakaland-accent font-semibold">
                      <Coins className="w-3.5 h-3.5" /> +{formatSakalekas(goal.reward)}
                    </div>
                    {goal.completedByMe && (
                      <span
                        className={cn(
                          "mt-2 inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400"
                        )}
                      >
                        Concluída
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-sakaland-primary" /> Últimas movimentações
          </h2>
          {data.recentTransactions.length === 0 ? (
            <p className="text-sm text-sakaland-muted">
              Nenhuma movimentação registrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-sakaland-white">{t.note || "Movimentação"}</p>
                    <p className="text-xs text-sakaland-muted">{formatDate(t.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      "font-semibold",
                      t.type === "credit" ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {t.type === "credit" ? "+" : "-"}
                    {formatSakalekas(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/profile"
            className="block mt-4 text-xs text-sakaland-primary hover:underline"
          >
            Ver histórico completo →
          </Link>
        </Card>
      </div>
    </div>
  );
}
