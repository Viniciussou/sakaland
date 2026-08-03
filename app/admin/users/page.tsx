import { listUsersPaginated } from "@/actions/user.actions";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = Number(searchParams.page) || 1;

  const { users, total, totalPages } = await listUsersPaginated(query, page);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Gerenciamento"
        title="Usuários"
        description="Cadastre, edite e gerencie o acesso de administradores e participantes."
      />
      <UsersTable users={users} total={total} page={page} totalPages={totalPages} query={query} />
    </div>
  );
}
