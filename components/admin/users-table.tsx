"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, Lock, Unlock, Trash2, KeyRound, Pencil, Users as UsersIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog, CONFIRM_INITIAL, type ConfirmState } from "@/components/ui/confirm-dialog";
import { formatSakalekas } from "@/lib/utils";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  toggleBlockUserAction,
  resetUserPasswordAction,
  type UserListItem,
} from "@/actions/user.actions";

export function UsersTable({
  users,
  total,
  page,
  totalPages,
  query,
}: {
  users: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [resetUser, setResetUser] = useState<UserListItem | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(CONFIRM_INITIAL);
  const [isPending, startTransition] = useTransition();

  // Busca com debounce refletida na URL (?q=), mantendo paginação server-side eficiente
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search === query) return;
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("q", search);
      else params.delete("q");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleDelete(u: UserListItem) {
    setConfirmState({
      open: true,
      title: "Excluir usuário",
      description: `Tem certeza que deseja excluir "${u.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteUserAction(u.id);
          res.success ? toast.success(res.message) : toast.error(res.message);
          setConfirmState(CONFIRM_INITIAL);
          router.refresh();
        });
      },
    });
  }

  function handleToggleBlock(id: string) {
    startTransition(async () => {
      const res = await toggleBlockUserAction(id);
      res.success ? toast.success(res.message) : toast.error(res.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sakaland-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou e-mail..."
            className="w-full rounded-lg bg-sakaland-surface border border-white/10 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-sakaland-red transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-sakaland-muted font-numeric hidden sm:inline">
            {total} usuário{total === 1 ? "" : "s"}
          </span>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Novo usuário
          </Button>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Nenhum usuário encontrado"
          description={query ? `Nenhum resultado para "${query}".` : "Crie o primeiro usuário para começar."}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          {/* Tabela — telas médias e grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-sakaland-muted border-b border-white/10">
                  <th className="p-4">Nome</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Papel</th>
                  <th className="p-4">Saldo</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4 text-sakaland-muted">{u.email}</td>
                    <td className="p-4">
                      <Badge variant={u.role === "admin" ? "warning" : "default"}>
                        {u.role === "admin" ? "Administrador" : "Participante"}
                      </Badge>
                    </td>
                    <td className="p-4 text-sakaland-gold font-numeric">
                      {formatSakalekas(u.balance)}
                    </td>
                    <td className="p-4">
                      <Badge variant={u.isBlocked ? "danger" : "success"}>
                        {u.isBlocked ? "Bloqueado" : "Ativo"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="!p-2" title="Editar" onClick={() => setEditUser(u)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!p-2" title="Resetar senha" onClick={() => setResetUser(u)}>
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!p-2"
                          title={u.isBlocked ? "Desbloquear" : "Bloquear"}
                          disabled={isPending}
                          onClick={() => handleToggleBlock(u.id)}
                        >
                          {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!p-2 hover:!text-sakaland-red"
                          title="Excluir"
                          disabled={isPending}
                          onClick={() => handleDelete(u)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartões — telas pequenas */}
          <div className="md:hidden divide-y divide-white/5">
            {users.map((u) => (
              <div key={u.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-sakaland-muted">{u.email}</p>
                  </div>
                  <span className="text-sakaland-gold font-numeric text-sm shrink-0">
                    {formatSakalekas(u.balance)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.role === "admin" ? "warning" : "default"}>
                    {u.role === "admin" ? "Admin" : "Participante"}
                  </Badge>
                  <Badge variant={u.isBlocked ? "danger" : "success"}>
                    {u.isBlocked ? "Bloqueado" : "Ativo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditUser(u)}>
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="!p-2" onClick={() => setResetUser(u)}>
                    <KeyRound className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="!p-2" onClick={() => handleToggleBlock(u.id)}>
                    {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="!p-2 hover:!text-sakaland-red" onClick={() => handleDelete(u)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              basePath={pathname}
              searchParams={{ q: query }}
            />
          </div>
        </Card>
      )}

      {/* Criar usuário */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo usuário">
        <ActionForm
          action={createUserAction}
          onSuccess={() => {
            setCreateOpen(false);
            router.refresh();
          }}
          className="space-y-4"
        >
          <Input id="name" name="name" label="Nome completo" required />
          <Input id="email" name="email" type="email" label="E-mail" required />
          <Input id="department" name="department" label="Departamento" />
          <Input id="password" name="password" type="password" label="Senha provisória" required />
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-sakaland-muted">Papel</label>
            <select
              name="role"
              className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-red"
            >
              <option value="participant">Participante</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <SubmitButton className="w-full" loadingText="Criando...">
            Criar usuário
          </SubmitButton>
        </ActionForm>
      </Modal>

      {/* Editar usuário */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar usuário">
        {editUser && (
          <ActionForm
            action={updateUserAction}
            onSuccess={() => {
              setEditUser(null);
              router.refresh();
            }}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={editUser.id} />
            <Input id="edit-name" name="name" label="Nome completo" defaultValue={editUser.name} required />
            <Input id="edit-email" name="email" type="email" label="E-mail" defaultValue={editUser.email} required />
            <Input id="edit-department" name="department" label="Departamento" defaultValue={editUser.department} />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-sakaland-muted">Papel</label>
              <select
                name="role"
                defaultValue={editUser.role}
                className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-red"
              >
                <option value="participant">Participante</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <SubmitButton className="w-full" loadingText="Salvando...">
              Salvar alterações
            </SubmitButton>
          </ActionForm>
        )}
      </Modal>

      {/* Resetar senha */}
      <Modal open={!!resetUser} onClose={() => setResetUser(null)} title="Resetar senha">
        {resetUser && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newPassword = String(formData.get("newPassword") || "");
              startTransition(async () => {
                const res = await resetUserPasswordAction(resetUser.id, newPassword);
                res.success ? toast.success(res.message) : toast.error(res.message);
                if (res.success) setResetUser(null);
              });
            }}
          >
            <p className="text-sm text-sakaland-muted">
              Defina uma nova senha provisória para <strong>{resetUser.name}</strong>.
            </p>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              label="Nova senha"
              placeholder="Mínimo 8 caracteres"
              required
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Salvando..." : "Redefinir senha"}
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        state={confirmState}
        loading={isPending}
        onClose={() => setConfirmState(CONFIRM_INITIAL)}
      />
    </div>
  );
}
