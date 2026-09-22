import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl2 bg-sakaland-surface border border-white/10 p-5 shadow-[0_1px_0_0_rgba(240,244,242,0.04)_inset]",
        className
      )}
      {...props}
    />
  );
}
