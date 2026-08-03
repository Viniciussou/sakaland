import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "danger" | "warning";
}) {
  const variants = {
    default: "bg-white/10 text-sakaland-white",
    success: "bg-emerald-500/15 text-emerald-400",
    danger: "bg-red-500/15 text-red-400",
    warning: "bg-amber-500/15 text-amber-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
