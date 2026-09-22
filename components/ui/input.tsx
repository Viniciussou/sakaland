import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs uppercase tracking-wider text-sakaland-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg bg-sakaland-surface border border-white/10 px-4 py-2.5 text-sm text-sakaland-white placeholder:text-sakaland-muted/60 outline-none transition-colors focus:border-sakaland-primary focus:ring-1 focus:ring-sakaland-primary",
            error && "border-red-500/70",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
