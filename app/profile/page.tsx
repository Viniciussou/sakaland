import { getSession } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { getMyActivity } from "@/actions/user.actions";
import { listMyPurchases } from "@/actions/purchase.actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSakalekas, formatDateTime, cn } from "@/lib/utils";
import {
  UpdateProfileForm,
  ChangePasswordForm,
} from "@/components/profile/profile-forms";
import { redirect } from "next/navigation";

const statusLabel: Record<string, { text: string; variant: "success" | "warning" | "danger" }> = {
  pending: { text: "Pendente", variant: "warning" },
  delivered: { text: "Entregue", variant: "success" },
  cancelled: { text: "Cancelado", variant: "danger" },
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect("/login");

  const [activity, purchases] = await Promise.all([
    getMyActivity(),
    session.role === "participant" ? listMyPurchases() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-sakaland-surface2 border border-white/10 flex items-center justify-center text-2xl font-display overflow-hidden">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl">{user.name}</h1>
          <p className="text-sm text-sakaland-muted">{user.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-lg mb-4">Informações pessoais</h2>
          <UpdateProfileForm
            name={user.name}
            department={user.department}
            avatarUrl={user.avatarUrl}
          />
        </Card>

        <Card>
          <h2 className="font-display text-lg mb-4">Alterar senha</h2>
          <ChangePasswordForm />
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-lg mb-4">Histórico de atividades</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-sakaland-muted">Nenhuma movimentação ainda.</p>
        ) : (
          <div className="space-y-3">
            {activity.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div>
                  <p>{t.note || "Movimentação de Sakalekas"}</p>
                  <p className="text-xs text-sakaland-muted">{formatDateTime(t.createdAt)}</p>
                </div>
                <span
                  className={cn(
                    "font-numeric",
                    t.type === "credit" ? "text-emerald-400" : "text-sakaland-red"
                  )}
                >
                  {t.type === "credit" ? "+" : "-"}
                  {formatSakalekas(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {session.role === "participant" && (
        <Card>
          <h2 className="font-display text-lg mb-4">Meus resgates</h2>
          {purchases.length === 0 ? (
            <p className="text-sm text-sakaland-muted">Você ainda não resgatou nenhum brinde.</p>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p>{p.rewardName}</p>
                    <p className="text-xs text-sakaland-muted">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sakaland-gold font-numeric">
                      {formatSakalekas(p.price)}
                    </span>
                    <Badge variant={statusLabel[p.status].variant}>
                      {statusLabel[p.status].text}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
