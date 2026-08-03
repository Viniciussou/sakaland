"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import {
  forgotPasswordAction,
  type ActionState,
} from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = { success: false };

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);

  useEffect(() => {
    if (state.message) {
      state.success ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-3xl mb-1">Recuperar senha</h2>
      <p className="text-sakaland-muted text-sm mb-8">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form action={formAction} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="E-mail"
          placeholder="voce@empresa.com"
          required
        />
        <SubmitButton className="w-full" loadingText="Enviando...">
          Enviar link de recuperação
        </SubmitButton>
      </form>

      <p className="mt-8 text-sm text-sakaland-muted text-center">
        Lembrou a senha?{" "}
        <Link href="/login" className="text-sakaland-red hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
