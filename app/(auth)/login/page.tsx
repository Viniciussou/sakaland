"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction, type ActionState } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = { success: false };

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Login realizado com sucesso!");
      router.push("/");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-3xl mb-1">Entrar</h2>
      <p className="text-sakaland-muted text-sm mb-8">
        Acesse sua conta para acompanhar suas Sakalekas.
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
        <Input
          id="password"
          name="password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          required
        />

        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-xs text-sakaland-muted hover:text-sakaland-primary transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <SubmitButton className="w-full" loadingText="Entrando...">
          Entrar
        </SubmitButton>
      </form>

      <p className="mt-8 text-sm text-sakaland-muted text-center">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-sakaland-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
