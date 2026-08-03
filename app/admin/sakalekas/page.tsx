import { listUsers } from "@/actions/user.actions";
import { listTransactionsPaginated } from "@/actions/transaction.actions";
import { SakalekasPanel } from "@/components/admin/sakalekas-panel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { formatSakalekas, formatDateTime, cn } from "@/lib/utils";
import { History } from "lucide-react";

const sourceLabels: Record<string, string> = {
  admin_grant: "Concessão manual",
  admin_revoke: "Remoção manual",
  goal_completed: "Meta concluída",
  purchase: "Resgate na loja",
  bulk_distribution: "Distribuição em massa",
  adjustment: "Ajuste",
};

export default async function AdminSakalekasPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const [users, { transactions, total, totalPages }] = await Promise.all([
    listUsers(),
    listTransactionsPaginated(page),
  ]);

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        eyebrow="Moeda oficial do evento"
        title="Gerenciar Sakalekas"
        description="Conceda, remova ou distribua a moeda oficial entre os participantes."
      />

      <SakalekasPanel users={users} />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Histórico de transações</h2>
          <span className="text-xs text-sakaland-muted font-numeric">
            {total} registro{total === 1 ? "" : "s"}
          </span>
        </div>

        {transactions.length === 0 ? (
          <EmptyState icon={History} title="Nenhuma transação registrada ainda" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-sakaland-muted border-b border-white/10">
                    <th className="p-3">Participante</th>
                    <th className="p-3">Origem</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Saldo após</th>
                    <th className="p-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">{t.userName}</td>
                      <td className="p-3">
                        <Badge variant={t.type === "credit" ? "success" : "danger"}>
                          {sourceLabels[t.source] || t.source}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "p-3 font-numeric",
                          t.type === "credit" ? "text-emerald-400" : "text-sakaland-red"
                        )}
                      >
                        {t.type === "credit" ? "+" : "-"}
                        {formatSakalekas(t.amount)}
                      </td>
                      <td className="p-3 text-sakaland-gold font-numeric">{formatSakalekas(t.balanceAfter)}</td>
                      <td className="p-3 text-sakaland-muted text-xs">
                        {formatDateTime(t.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} basePath="/admin/sakalekas" />
          </>
        )}
      </Card>
    </div>
  );
}
