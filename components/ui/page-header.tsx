import { cn } from "@/lib/utils";

/**
 * Cabeçalho padrão de página: selo/eyebrow + título + descrição opcional +
 * slot de ações à direita. Usado em todas as telas para manter consistência
 * visual e hierarquia de informação previsível em todo o sistema.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", className)}>
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.25em] text-sakaland-red mb-1.5 flex items-center gap-2">
            <span className="w-4 h-px bg-sakaland-red/60" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-sakaland-muted mt-2 max-w-xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
