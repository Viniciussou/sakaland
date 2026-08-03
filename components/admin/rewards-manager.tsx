"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, CONFIRM_INITIAL, type ConfirmState } from "@/components/ui/confirm-dialog";
import { Gift } from "lucide-react";
import { formatSakalekas } from "@/lib/utils";
import {
  createRewardAction,
  updateRewardAction,
  deleteRewardAction,
  type RewardListItem,
} from "@/actions/reward.actions";

export function RewardsManager({ rewards }: { rewards: RewardListItem[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editReward, setEditReward] = useState<RewardListItem | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(CONFIRM_INITIAL);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    setConfirmState({
      open: true,
      title: "Remover brinde",
      description: `Remover "${name}" da loja? Ele deixará de ficar visível para os participantes.`,
      confirmLabel: "Remover",
      danger: true,
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteRewardAction(id);
          res.success ? toast.success(res.message) : toast.error(res.message);
          setConfirmState(CONFIRM_INITIAL);
          router.refresh();
        });
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Novo brinde
        </Button>
      </div>

      {rewards.length === 0 ? (
        <EmptyState icon={Gift} title="Nenhum brinde cadastrado" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((r) => (
            <Card key={r.id} className="p-0 overflow-hidden">
              <div className="relative aspect-[4/3] bg-sakaland-surface2">
                <Image src={r.imageUrl} alt={r.name} fill className="object-cover" sizes="300px" />
                {r.featured && (
                  <Badge className="absolute top-2 left-2" variant="warning">
                    <Star className="w-3 h-3 mr-1 inline" /> Destaque
                  </Badge>
                )}
                {!r.isActive && (
                  <Badge className="absolute top-2 right-2" variant="danger">
                    Inativo
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg mb-1">{r.name}</h3>
                <p className="text-xs text-sakaland-muted mb-3 line-clamp-2">{r.description}</p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-sakaland-gold font-numeric">
                    {formatSakalekas(r.price)} Sakalekas
                  </span>
                  <span className="text-sakaland-muted font-numeric">{r.stock} em estoque</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditReward(r)}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:!text-sakaland-red"
                    disabled={isPending}
                    onClick={() => handleDelete(r.id, r.name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo brinde">
        <RewardForm
          action={createRewardAction}
          onSuccess={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      </Modal>

      <Modal open={!!editReward} onClose={() => setEditReward(null)} title="Editar brinde">
        {editReward && (
          <RewardForm
            action={updateRewardAction}
            reward={editReward}
            onSuccess={() => {
              setEditReward(null);
              router.refresh();
            }}
          />
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

function RewardForm({
  action,
  reward,
  onSuccess,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  reward?: RewardListItem;
  onSuccess: () => void;
}) {
  return (
    <ActionForm action={action} onSuccess={onSuccess} className="space-y-4">
      {reward && <input type="hidden" name="id" value={reward.id} />}
      <Input id="name" name="name" label="Nome do brinde" defaultValue={reward?.name} required />
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-sakaland-muted">Descrição</label>
        <textarea
          name="description"
          defaultValue={reward?.description}
          required
          rows={3}
          className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-red resize-none"
        />
      </div>
      <Input
        id="imageUrl"
        name="imageUrl"
        label="URL da imagem"
        defaultValue={reward?.imageUrl}
        placeholder="https://..."
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="stock"
          name="stock"
          type="number"
          min={0}
          label="Estoque"
          defaultValue={reward?.stock}
          required
        />
        <Input
          id="price"
          name="price"
          type="number"
          min={0}
          label="Valor em Sakalekas"
          defaultValue={reward?.price}
          required
        />
      </div>
      <Input
        id="category"
        name="category"
        label="Categoria"
        defaultValue={reward?.category}
        placeholder="Ex: Eletrônicos"
        required
      />
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={reward?.featured}
            className="accent-sakaland-red"
          />
          Destaque
        </label>
        {reward && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={reward.isActive}
              className="accent-sakaland-red"
            />
            Ativo na loja
          </label>
        )}
      </div>
      <SubmitButton className="w-full" loadingText="Salvando...">
        {reward ? "Salvar alterações" : "Adicionar brinde"}
      </SubmitButton>
    </ActionForm>
  );
}
