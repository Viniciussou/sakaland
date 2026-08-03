"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { updateSettingsAction } from "@/actions/settings.actions";

function toDateInput(iso: string) {
  return iso ? iso.split("T")[0] : "";
}

export function SettingsForm({ settings }: { settings: any }) {
  const router = useRouter();

  return (
    <ActionForm
      action={updateSettingsAction}
      onSuccess={() => router.refresh()}
      className="space-y-6"
    >
      <Card>
        <h2 className="font-display text-lg mb-4">Informações do evento</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input id="eventName" name="eventName" label="Nome do evento" defaultValue={settings.eventName} />
          <Input id="primaryColor" name="primaryColor" label="Cor primária" defaultValue={settings.primaryColor} type="color" />
          <Input id="currencyName" name="currencyName" label="Nome da moeda (plural)" defaultValue={settings.currencyName} />
          <Input id="currencySingular" name="currencySingular" label="Nome da moeda (singular)" defaultValue={settings.currencySingular} />
          <Input id="eventStartDate" name="eventStartDate" type="date" label="Início do evento" defaultValue={toDateInput(settings.eventStartDate)} />
          <Input id="eventEndDate" name="eventEndDate" type="date" label="Término do evento" defaultValue={toDateInput(settings.eventEndDate)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg mb-4">Funcionalidades</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: "storeEnabled", label: "Loja habilitada" },
            { key: "rankingEnabled", label: "Ranking habilitado" },
            { key: "goalsEnabled", label: "Metas habilitadas" },
            { key: "registrationEnabled", label: "Cadastro de novos usuários habilitado" },
          ].map((f) => (
            <label key={f.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={f.key}
                defaultChecked={settings.features?.[f.key]}
                className="accent-sakaland-red"
              />
              {f.label}
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg mb-4">Mensagens automáticas</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-sakaland-muted">
              Boas-vindas
            </label>
            <textarea
              name="welcomeMessage"
              defaultValue={settings.automatedMessages?.welcomeMessage}
              rows={2}
              className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-red resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-sakaland-muted">
              Confirmação de resgate
            </label>
            <textarea
              name="purchaseConfirmation"
              defaultValue={settings.automatedMessages?.purchaseConfirmation}
              rows={2}
              className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-red resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-sakaland-muted">
              Meta concluída
            </label>
            <textarea
              name="goalCompleted"
              defaultValue={settings.automatedMessages?.goalCompleted}
              rows={2}
              className="w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-sakaland-red resize-none"
            />
          </div>
        </div>
      </Card>

      <SubmitButton loadingText="Salvando...">Salvar configurações</SubmitButton>
    </ActionForm>
  );
}
