"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import type { ActionState } from "@/actions/auth.actions";

const initialState: ActionState = { success: false };

export function ActionForm({
  action,
  onSuccess,
  children,
  className,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  onSuccess?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useFormState(action, initialState);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (state.success) {
      if (state.message) toast.success(state.message);
      onSuccess?.();
    } else if (state.message) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
