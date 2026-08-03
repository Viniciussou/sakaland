import { listGoals } from "@/actions/goal.actions";
import { listUsers } from "@/actions/user.actions";
import { GoalsManager } from "@/components/admin/goals-manager";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminGoalsPage() {
  const [goals, users] = await Promise.all([listGoals(), listUsers()]);
  const participants = users.filter((u) => u.role === "participant");

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Engajamento"
        title="Metas"
        description="Crie desafios do evento e credite Sakalekas automaticamente quando forem cumpridos."
      />
      <GoalsManager goals={goals} participants={participants} />
    </div>
  );
}
