import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants: Record<string, string> = {
  primary:
    "bg-sakaland-red text-white hover:bg-sakaland-redDark shadow-lg shadow-sakaland-red/20",
  secondary:
    "bg-sakaland-surface2 text-sakaland-white border border-white/10 hover:border-white/20",
  ghost: "bg-transparent text-sakaland-white hover:bg-white/5",
  danger: "bg-red-900/30 text-red-300 border border-red-800 hover:bg-red-900/50",
};

const sizes: Record<string, string> = {
  sm: "text-xs px-3 py-1.5 rounded-md",
  md: "text-sm px-4 py-2.5 rounded-lg",
  lg: "text-base px-6 py-3 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
