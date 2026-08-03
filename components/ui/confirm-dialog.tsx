"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

export interface ConfirmState {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export const CONFIRM_INITIAL: ConfirmState = {
  open: false,
  title: "",
  onConfirm: () => {},
};

/**
 * Diálogo de confirmação estilizado — substitui o window.confirm() nativo
 * do navegador por um componente consistente com o restante do sistema.
 */
export function ConfirmDialog({
  state,
  onClose,
  loading,
}: {
  state: ConfirmState;
  onClose: () => void;
  loading?: boolean;
}) {
  return (
    <Modal open={state.open} onClose={onClose} title={state.title}>
      <div className="space-y-5">
        <div className="flex gap-3">
          <div
            className={
              state.danger
                ? "w-9 h-9 rounded-full bg-sakaland-red/15 border border-sakaland-red/30 flex items-center justify-center shrink-0"
                : "w-9 h-9 rounded-full bg-sakaland-gold/15 border border-sakaland-gold/30 flex items-center justify-center shrink-0"
            }
          >
            <AlertTriangle
              className={
                state.danger ? "w-4 h-4 text-sakaland-red" : "w-4 h-4 text-sakaland-gold"
              }
            />
          </div>
          {state.description && (
            <p className="text-sm text-sakaland-muted leading-relaxed pt-1.5">
              {state.description}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={state.danger ? "danger" : "primary"}
            onClick={state.onConfirm}
            disabled={loading}
          >
            {loading ? "Processando..." : state.confirmLabel || "Confirmar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
