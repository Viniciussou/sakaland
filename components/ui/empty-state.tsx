import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-white/10 rounded-xl2">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-sakaland-muted" />
      </div>
      <h3 className="font-display text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-sakaland-muted max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
