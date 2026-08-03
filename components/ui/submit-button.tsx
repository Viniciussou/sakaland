"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "./button";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  loadingText,
  disabled,
  ...props
}: ButtonProps & { loadingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? loadingText || "Enviando..." : children}
    </Button>
  );
}
