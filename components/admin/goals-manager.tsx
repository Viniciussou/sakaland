"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Power, CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, CONFIRM_INITIAL, type ConfirmState } from "@/components/ui/confirm-dialog";
import { Target } from "lucide-react";
import { formatDate, formatSakalekas } from "@/lib/utils";
import {
  createGoalAction,
  updateGoalAction,
  deleteGoalAction,
  toggleGoalActiveAction,
  markGoalCompletedForUserAction,
  type GoalListItem,
} from "@/actions/goal.actions";
import type { UserListItem } from "@/actions/user.actions";

function toDateInput(iso: string) {
  return iso.split("T")[0];
}

export function GoalsManager({
  goals,
  participants,
}: {
  goals: GoalListItem[];
  participants: UserListItem[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<GoalListItem | null>(null);
  const [completeGoal, setCompleteGoal] = useState<GoalListItem | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(CONFIRM_INITIAL);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    setConfirmState({
      open: true,
      title: "Excluir meta",
      description: `Tem certeza que deseja excluir "${title}"? Participantes que já cumpriram essa meta manterão as Sakalekas recebidas.`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteGoalAction(id);
          res.success ? toast.success(res.message) : toast.error(res.message);
          setConfirmState(CONFIRM_INITIAL);
          router.refresh();
        });
      },
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleGoalActiveAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Nova meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="Nenhuma meta cadastrada" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <Card key={g.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display text-lg">{g.title}</h3>
                <Badge variant={g.isActive ? "success" : "default"}>
                  {g.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <p className="text-sm text-sakaland-muted mb-3">{g.description}</p>
              <div className="flex items-center justify-between text-xs text-sakaland-muted mb-4">
                <span>
                  {formatDate(g.startDate)} — {formatDate(g.endDate)}
                </span>
                <span className="text-sakaland-accent font-numeric">
                  +{formatSakalekas(g.reward)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-sakaland-muted">
                  {g.completedCount} conclusão(ões)
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!p-2"
                    title="Marcar conclusão de participante"
                    onClick={() => setCompleteGoal(g)}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!p-2"
                    title={g.isActive ? "Desativar" : "Ativar"}
                    disabled={isPending}
                    onClick={() => handleToggle(g.id)}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!p-2"
                    title="Editar"
                    onClick={() => setEditGoal(g)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!p-2 hover:!text-red-400"
                    title="Excluir"
                    disabled={isPending}
                    onClick={() => handleDelete(g.id, g.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova meta">
        <ActionForm
          action={createGoalAction}
          onSuccess={() => {
            setCreateOpen(false);
            router.refresh();
          }}
          className="space-y-4"
        >
          <Input id="title" name="title" label="Título" required />
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-sakaland-muted">
              Descrição
            </label>
            <textarea
              name="description"
              required
              rows={3}
              className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-primary resize-none"
            />
          </div>
          <Input id="reward" name="reward" type="number" min={0} label="Sakalekas ao concluir" required />
          <div className="grid grid-cols-2 gap-4">
            <Input id="startDate" name="startDate" type="date" label="Início" required />
            <Input id="endDate" name="endDate" type="date" label="Término" required />
          </div>
          <SubmitButton className="w-full" loadingText="Criando...">
            Criar meta
          </SubmitButton>
        </ActionForm>
      </Modal>

      <Modal open={!!editGoal} onClose={() => setEditGoal(null)} title="Editar meta">
        {editGoal && (
          <ActionForm
            action={updateGoalAction}
            onSuccess={() => {
              setEditGoal(null);
              router.refresh();
            }}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={editGoal.id} />
            <Input id="edit-title" name="title" label="Título" defaultValue={editGoal.title} required />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-sakaland-muted">
                Descrição
              </label>
              <textarea
                name="description"
                defaultValue={editGoal.description}
                required
                rows={3}
                className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-primary resize-none"
              />
            </div>
            <Input
              id="edit-reward"
              name="reward"
              type="number"
              min={0}
              label="Sakalekas ao concluir"
              defaultValue={editGoal.reward}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="edit-startDate"
                name="startDate"
                type="date"
                label="Início"
                defaultValue={toDateInput(editGoal.startDate)}
                required
              />
              <Input
                id="edit-endDate"
                name="endDate"
                type="date"
                label="Término"
                defaultValue={toDateInput(editGoal.endDate)}
                required
              />
            </div>
            <SubmitButton className="w-full" loadingText="Salvando...">
              Salvar alterações
            </SubmitButton>
          </ActionForm>
        )}
      </Modal>

      <Modal
        open={!!completeGoal}
        onClose={() => setCompleteGoal(null)}
        title="Marcar conclusão de meta"
      >
        {completeGoal && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userId = String(formData.get("userId") || "");
              if (!userId) return;
              startTransition(async () => {
                const res = await markGoalCompletedForUserAction(completeGoal.id, userId);
                res.success ? toast.success(res.message) : toast.error(res.message);
                if (res.success) {
                  setCompleteGoal(null);
                  router.refresh();
                }
              });
            }}
          >
            <p className="text-sm text-sakaland-muted">
              Selecione o participante que concluiu <strong>{completeGoal.title}</strong>. As
              Sakalekas serão creditadas automaticamente.
            </p>
            <select
              name="userId"
              required
              className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-primary"
            >
              <option value="">Selecione um participante</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.email}
                </option>
              ))}
            </select>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Processando..." : "Confirmar conclusão"}
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
