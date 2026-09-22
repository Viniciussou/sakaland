"use client";

import { useRef, useState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateProfileAction } from "@/actions/user.actions";
import { changePasswordAction } from "@/actions/auth.actions";
import { toast } from "sonner";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB — precisa bater com lib/validation.ts

function AvatarUploadField({
  name,
  currentAvatarUrl,
}: {
  name: string;
  currentAvatarUrl?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentAvatarUrl);
  const [removeFlag, setRemoveFlag] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("A imagem deve ter no máximo 2MB.");
      e.target.value = "";
      return;
    }

    setRemoveFlag(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview(undefined);
    setRemoveFlag(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="w-full space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-sakaland-muted">
        Foto de perfil
      </label>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-sakaland-surface2 border border-white/10 flex items-center justify-center text-xl font-display overflow-hidden shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pré-visualização" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sakaland-muted">?</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Escolher foto do computador
          </Button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-sakaland-muted hover:text-red-400 transition-colors text-left"
            >
              Remover foto
            </button>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        name={name}
        onChange={handleFileChange}
        className="hidden"
      />
      <input type="hidden" name="removeAvatar" value={removeFlag ? "1" : "0"} />
      <p className="text-[11px] text-sakaland-muted/70">JPG, PNG, WEBP ou GIF — até 2MB.</p>
    </div>
  );
}

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
      <AvatarUploadField name="avatarFile" currentAvatarUrl={avatarUrl} />
      <Input id="name" name="name" label="Nome completo" defaultValue={name} required />
      <Input
        id="department"
        name="department"
        label="Departamento"
        defaultValue={department}
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
