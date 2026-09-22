"use client";

import { Suspense, useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  resetPasswordAction,
  type ActionState,
} from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = { success: false };

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/login");
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  if (!token) {
    return (
      <div className="animate-fade-up text-center">
        <h2 className="font-display text-2xl mb-2">Link inválido</h2>
        <p className="text-sakaland-muted text-sm mb-6">
          O link de redefinição de senha está ausente ou expirado.
        </p>
        <Link href="/forgot-password" className="text-sakaland-primary hover:underline text-sm">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-3xl mb-1">Nova senha</h2>
      <p className="text-sakaland-muted text-sm mb-8">
        Escolha uma nova senha para sua conta.
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <Input
          id="password"
          name="password"
          type="password"
          label="Nova senha"
          placeholder="Mínimo 8 caracteres"
          required
        />
        <SubmitButton className="w-full" loadingText="Salvando...">
          Redefinir senha
        </SubmitButton>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-fade-up text-sm text-sakaland-muted">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
