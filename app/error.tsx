"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sakaland-black text-center px-4">
      <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
      <h1 className="font-display text-2xl mb-2">Algo deu errado</h1>
      <p className="text-sakaland-muted mb-6 max-w-sm">
        Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-lg bg-sakaland-primary text-white text-sm font-medium hover:bg-sakaland-primaryDark transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
