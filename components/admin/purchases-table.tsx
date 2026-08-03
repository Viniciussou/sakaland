"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";
import { formatSakalekas, formatDateTime } from "@/lib/utils";
import { updatePurchaseStatusAction, type PurchaseListItem } from "@/actions/purchase.actions";

const statusMeta: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  pending: { label: "Pendente", variant: "warning" },
  delivered: { label: "Entregue", variant: "success" },
  cancelled: { label: "Cancelado", variant: "danger" },
};

export function PurchasesTable({
  purchases,
  total,
  page,
  totalPages,
}: {
  purchases: PurchaseListItem[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateStatus(id: string, status: "pending" | "delivered" | "cancelled") {
    startTransition(async () => {
      const res = await updatePurchaseStatusAction(id, status);
      res.success ? toast.success(res.message) : toast.error(res.message);
      router.refresh();
    });
  }

  return (
    <Card className={purchases.length === 0 ? "" : "p-0 overflow-hidden"}>
      {purchases.length === 0 ? (
        <>
          <h2 className="font-display text-lg mb-4">Resgates da loja</h2>
          <EmptyState icon={PackageSearch} title="Nenhum resgate registrado ainda" />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="font-display text-lg">Resgates da loja</h2>
            <span className="text-xs text-sakaland-muted font-numeric">
              {total} registro{total === 1 ? "" : "s"}
            </span>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-sakaland-muted border-b border-white/10">
                  <th className="p-3 pl-5">Participante</th>
                  <th className="p-3">Brinde</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Data</th>
                  <th className="p-3 pr-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 pl-5">{p.userName}</td>
                    <td className="p-3">{p.rewardName}</td>
                    <td className="p-3 text-sakaland-gold font-numeric">{formatSakalekas(p.price)}</td>
                    <td className="p-3">
                      <Badge variant={statusMeta[p.status].variant}>{statusMeta[p.status].label}</Badge>
                    </td>
                    <td className="p-3 text-xs text-sakaland-muted">{formatDateTime(p.createdAt)}</td>
                    <td className="p-3 pr-5 text-right">
                      <select
                        disabled={isPending}
                        value={p.status}
                        onChange={(e) => updateStatus(p.id, e.target.value as any)}
                        className="rounded-lg bg-sakaland-surface border border-white/10 px-2 py-1.5 text-xs outline-none focus:border-sakaland-red"
                      >
                        <option value="pending">Pendente</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-5">
            <Pagination page={page} totalPages={totalPages} basePath="/admin/store" />
          </div>
        </>
      )}
    </Card>
  );
}
