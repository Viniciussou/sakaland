"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerAction, type ActionState } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = { success: false };

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(registerAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Conta criada com sucesso! Bem-vindo ao Sakaland.");
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-3xl mb-1">Criar conta</h2>
      <p className="text-sakaland-muted text-sm mb-8">
        Cadastre-se para participar do evento Sakaland.
      </p>

      <form action={formAction} className="space-y-4">
        <Input
          id="name"
          name="name"
          label="Nome completo"
          placeholder="Seu nome"
          required
          error={state.fieldErrors?.name}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="E-mail"
          placeholder="voce@empresa.com"
          required
          error={state.fieldErrors?.email}
        />
        <Input
          id="department"
          name="department"
          label="Departamento (opcional)"
          placeholder="Ex: Marketing"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Senha"
          placeholder="Mínimo 8 caracteres"
          required
          error={state.fieldErrors?.password}
        />

        <SubmitButton className="w-full" loadingText="Criando conta...">
          Criar conta
        </SubmitButton>
      </form>

      <p className="mt-8 text-sm text-sakaland-muted text-center">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-sakaland-red hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
