"use client";

import { ActionForm } from "@/components/ui/action-form";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateProfileAction } from "@/actions/user.actions";
import { changePasswordAction } from "@/actions/auth.actions";

export function UpdateProfileForm({
  name,
  department,
  avatarUrl,
}: {
  name: string;
  department?: string;
  avatarUrl?: string;
}) {
  return (
    <ActionForm action={updateProfileAction} className="space-y-4">
      <Input id="name" name="name" label="Nome completo" defaultValue={name} required />
      <Input
        id="department"
        name="department"
        label="Departamento"
        defaultValue={department}
      />
      <Input
        id="avatarUrl"
        name="avatarUrl"
        label="URL da foto de perfil"
        defaultValue={avatarUrl}
        placeholder="https://..."
      />
      <SubmitButton loadingText="Salvando...">Salvar alterações</SubmitButton>
    </ActionForm>
  );
}

export function ChangePasswordForm() {
  return (
    <ActionForm action={changePasswordAction} className="space-y-4">
      <Input
        id="currentPassword"
        name="currentPassword"
        type="password"
        label="Senha atual"
        required
      />
      <Input
        id="newPassword"
        name="newPassword"
        type="password"
        label="Nova senha"
        placeholder="Mínimo 8 caracteres"
        required
      />
      <SubmitButton variant="secondary" loadingText="Alterando...">
        Alterar senha
      </SubmitButton>
    </ActionForm>
  );
}
