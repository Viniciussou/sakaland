"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Users as UsersIcon, MinusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { UserListItem } from "@/actions/user.actions";
import {
  grantSakalekasAction,
  revokeSakalekasAction,
  bulkDistributionAction,
} from "@/actions/transaction.actions";

export function SakalekasPanel({ users }: { users: UserListItem[] }) {
  const router = useRouter();
  const participants = users.filter((u) => u.role === "participant");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <h2 className="font-display text-lg mb-4 flex items-center gap-2">
          <Coins className="w-4 h-4 text-sakaland-accent" /> Conceder Sakalekas
        </h2>
        <ActionForm
          action={grantSakalekasAction}
          onSuccess={() => router.refresh()}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-sakaland-muted">
              Participante
            </label>
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
          </div>
          <Input id="grant-amount" name="amount" type="number" min={1} step={1} label="Quantidade" required />
          <Input id="grant-note" name="note" label="Observação (opcional)" placeholder="Ex: Participação na palestra" />
          <SubmitButton className="w-full" loadingText="Concedendo...">
            Conceder Sakalekas
          </SubmitButton>
        </ActionForm>
      </Card>

      <Card>
        <h2 className="font-display text-lg mb-4 flex items-center gap-2">
          <MinusCircle className="w-4 h-4 text-red-400" /> Remover Sakalekas
        </h2>
        <ActionForm
          action={revokeSakalekasAction}
          onSuccess={() => router.refresh()}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-sakaland-muted">
              Participante
            </label>
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
          </div>
          <Input id="revoke-amount" name="amount" type="number" min={1} step={1} label="Quantidade" required />
          <Input id="revoke-note" name="note" label="Motivo (opcional)" placeholder="Ex: Correção de saldo" />
          <SubmitButton variant="danger" className="w-full" loadingText="Removendo...">
            Remover Sakalekas
          </SubmitButton>
        </ActionForm>
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="font-display text-lg mb-4 flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-sakaland-white" /> Distribuição em massa
        </h2>
        <ActionForm
          action={bulkDistributionAction}
          onSuccess={() => {
            setSelectedIds([]);
            router.refresh();
          }}
          className="space-y-4"
        >
          <input type="hidden" name="userIds" value={selectedIds.join(",")} />
          <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10 divide-y divide-white/5">
            {participants.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-white/[0.03]"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="accent-sakaland-primary"
                />
                {p.name} <span className="text-sakaland-muted">— {p.email}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-sakaland-muted">
            {selectedIds.length} participante(s) selecionado(s)
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="bulk-amount" name="amount" type="number" min={1} step={1} label="Quantidade por participante" required />
            <Input id="bulk-note" name="note" label="Observação (opcional)" />
          </div>
          <SubmitButton
            className="w-full"
            disabled={selectedIds.length === 0}
            loadingText="Distribuindo..."
          >
            Distribuir para selecionados
          </SubmitButton>
        </ActionForm>
      </Card>
    </div>
  );
}
