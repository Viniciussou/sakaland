import { getAdminDashboardStats } from "@/actions/dashboard.actions";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { FileSpreadsheet, FileText, Users, Coins, Gift, Target, ArrowRight } from "lucide-react";
import { formatSakalekas } from "@/lib/utils";

export default async function AdminReportsPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        eyebrow="Exportação de dados"
        title="Relatórios"
        description="Exporte um retrato completo do evento para compartilhar com a diretoria ou arquivar."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Participantes" value={stats.totalParticipants} icon={Users} />
        <StatCard
          label="Sakalekas distribuídas"
          value={formatSakalekas(stats.totalSakalekasDistributed)}
          icon={Coins}
          accent="accent"
        />
        <StatCard label="Brindes entregues" value={stats.totalRewardsDelivered} icon={Gift} />
        <StatCard label="Metas concluídas" value={stats.completedGoals} icon={Target} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <a
          href="/api/reports/export/excel"
          className="group block rounded-xl2 bg-sakaland-surface border border-white/10 p-5 hover:border-emerald-500/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-display text-lg mb-1">Planilha completa</h3>
          <p className="text-xs text-sakaland-muted mb-4">
            Participantes, transações e resgates em abas separadas (.xlsx).
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
            Baixar Excel <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>

        <a
          href="/api/reports/export/pdf"
          className="group block rounded-xl2 bg-sakaland-surface border border-white/10 p-5 hover:border-sakaland-primary/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-sakaland-primary/15 border border-sakaland-primary/25 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-sakaland-primary" />
          </div>
          <h3 className="font-display text-lg mb-1">Resumo executivo</h3>
          <p className="text-xs text-sakaland-muted mb-4">
            Um documento enxuto com os principais números e o top 10 do ranking.
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-sakaland-primary font-medium">
            Baixar PDF <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>
      </div>
    </div>
  );
}
