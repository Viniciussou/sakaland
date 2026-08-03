import { listRewards } from "@/actions/reward.actions";
import { getParticipantDashboard } from "@/actions/dashboard.actions";
import { StoreGrid } from "@/components/store/store-grid";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag } from "lucide-react";

export default async function StorePage() {
  const [rewards, dashboard] = await Promise.all([
    listRewards(true),
    getParticipantDashboard(),
  ]);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Troque suas Sakalekas"
        title="Loja de brindes"
        description="Resgate itens exclusivos do evento com o saldo que você já conquistou."
      />

      {rewards.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="A loja ainda não tem itens"
          description="Assim que os administradores adicionarem brindes, eles aparecerão aqui."
        />
      ) : (
        <StoreGrid rewards={rewards} balance={dashboard.balance} />
      )}
    </div>
  );
}

