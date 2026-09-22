import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logotipo oficial da Distribuidora Sakamoto — renderizado sobre uma placa
 * clara para garantir contraste contra o fundo escuro do sistema.
 */
export function Logo({
  height = 22,
  className,
  plaqueClassName,
}: {
  height?: number;
  className?: string;
  plaqueClassName?: string;
}) {
  const width = Math.round(height * (1400 / 253));

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-sakaland-white rounded-md shrink-0",
        plaqueClassName
      )}
      style={{ padding: `${Math.max(4, height * 0.28)}px ${Math.max(8, height * 0.5)}px` }}
    >
      <Image
        src="/logo-sakamoto.png"
        alt="Distribuidora Sakamoto"
        width={width}
        height={height}
        className={cn("object-contain", className)}
        priority
      />
    </span>
  );
}
