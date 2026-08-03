import { listRewards } from "@/actions/reward.actions";
import { listAllPurchasesPaginated } from "@/actions/purchase.actions";
import { RewardsManager } from "@/components/admin/rewards-manager";
import { PurchasesTable } from "@/components/admin/purchases-table";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminStorePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const [rewards, purchasesData] = await Promise.all([
    listRewards(),
    listAllPurchasesPaginated(page),
  ]);

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        eyebrow="Loja de brindes"
        title="Gerenciar loja"
        description="Cadastre brindes, controle estoque e acompanhe os resgates dos participantes."
      />

      <RewardsManager rewards={rewards} />
      <PurchasesTable
        purchases={purchasesData.purchases}
        total={purchasesData.total}
        page={purchasesData.page}
        totalPages={purchasesData.totalPages}
      />
    </div>
  );
}
