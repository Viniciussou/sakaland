import { listLogsPaginated } from "@/actions/log.actions";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollText } from "lucide-react";

const actionLabels: Record<string, string> = {
  "user.login": "Login realizado",
  "user.register": "Novo cadastro",
  "user.create_by_admin": "Usuário criado pelo admin",
  "user.update": "Usuário atualizado",
  "user.delete": "Usuário excluído",
  "user.block": "Usuário bloqueado",
  "user.unblock": "Usuário desbloqueado",
  "user.admin_reset_password": "Senha redefinida pelo admin",
  "sakalekas.grant": "Sakalekas concedidas",
  "sakalekas.revoke": "Sakalekas removidas",
  "sakalekas.bulk_distribution": "Distribuição em massa",
  "reward.purchase": "Brinde resgatado",
  "reward.create": "Brinde criado",
  "reward.update": "Brinde atualizado",
  "reward.delete": "Brinde removido",
  "goal.create": "Meta criada",
  "goal.update": "Meta atualizada",
  "goal.delete": "Meta excluída",
  "goal.mark_completed": "Meta concluída para participante",
  "settings.update": "Configurações atualizadas",
};

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { logs, total, totalPages } = await listLogsPaginated(page);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Auditoria"
        title="Logs do sistema"
        description="Registro cronológico de todas as ações administrativas sensíveis."
      />

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="Nenhum registro de auditoria ainda" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="text-xs text-sakaland-muted font-numeric">
              {total} registro{total === 1 ? "" : "s"}
            </span>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-sakaland-muted border-b border-white/10">
                  <th className="p-3 pl-5">Autor</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Alvo</th>
                  <th className="p-3 pr-5">Data</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 pl-5">{l.actorName}</td>
                    <td className="p-3">
                      <code className="text-xs bg-white/5 px-2 py-1 rounded">
                        {actionLabels[l.action] || l.action}
                      </code>
                    </td>
                    <td className="p-3 text-sakaland-muted text-xs">
                      {l.targetType ? `${l.targetType} · ${l.targetId?.slice(-6)}` : "—"}
                    </td>
                    <td className="p-3 pr-5 text-xs text-sakaland-muted">
                      {formatDateTime(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-5">
            <Pagination page={page} totalPages={totalPages} basePath="/admin/logs" />
          </div>
        </Card>
      )}
    </div>
  );
}
