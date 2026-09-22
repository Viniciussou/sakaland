import { getAdminDashboardStats } from "@/actions/dashboard.actions";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { MedalBadge } from "@/components/ui/medal-badge";
import { PageHeader } from "@/components/ui/page-header";
import { UsageChart } from "@/components/admin/usage-chart";
import { formatSakalekas, formatDateTime } from "@/lib/utils";
import { Users, Coins, Gift, Target, Activity } from "lucide-react";

const actionLabels: Record<string, string> = {
  "user.login": "Login realizado",
  "user.register": "Novo cadastro",
  "sakalekas.grant": "Sakalekas concedidas",
  "sakalekas.revoke": "Sakalekas removidas",
  "sakalekas.bulk_distribution": "Distribuição em massa",
  "reward.purchase": "Brinde resgatado",
  "reward.create": "Brinde criado",
  "goal.create": "Meta criada",
  "goal.mark_completed": "Meta concluída",
  "user.block": "Usuário bloqueado",
  "user.unblock": "Usuário desbloqueado",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        eyebrow="Visão geral do evento"
        title="Dashboard administrativo"
        description="Acompanhe em tempo real a participação, o saldo distribuído e a atividade do sistema."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Participantes"
          value={stats.totalParticipants}
          icon={Users}
          accent="white"
        />
        <StatCard
          label="Sakalekas distribuídas"
          value={formatSakalekas(stats.totalSakalekasDistributed)}
          icon={Coins}
          accent="accent"
        />
        <StatCard
          label="Brindes entregues"
          value={stats.totalRewardsDelivered}
          icon={Gift}
          accent="primary"
        />
        <StatCard
          label="Metas concluídas"
          value={stats.completedGoals}
          icon={Target}
          accent="white"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg mb-4">Uso do sistema (7 dias)</h2>
          <UsageChart data={stats.dailyUsage} />
        </Card>

        <Card>
          <h2 className="font-display text-lg mb-4">Top 5 do ranking</h2>
          <div className="space-y-3">
            {stats.ranking.map((p) => (
              <div key={p.position} className="flex items-center gap-3">
                <MedalBadge position={p.position} />
                <span className="flex-1 text-sm truncate">{p.name}</span>
                <span className="text-sakaland-accent text-sm font-numeric">
                  {formatSakalekas(p.balance)}
                </span>
              </div>
            ))}
            {stats.ranking.length === 0 && (
              <p className="text-sm text-sakaland-muted">Nenhum participante ainda.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-lg mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sakaland-primary" /> Atividade recente
        </h2>
        <div className="space-y-3">
          {stats.recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0"
            >
              <span>
                <span className="text-sakaland-white">{log.actorName}</span>{" "}
                <span className="text-sakaland-muted">
                  — {actionLabels[log.action] || log.action}
                </span>
              </span>
              <span className="text-xs text-sakaland-muted">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          ))}
          {stats.recentLogs.length === 0 && (
            <p className="text-sm text-sakaland-muted">Nenhuma atividade registrada ainda.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
