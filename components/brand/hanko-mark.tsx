import { cn } from "@/lib/utils";

/**
 * Marca do Sakaland: um carimbo (hanko) de tinta vermelhão sobre papel,
 * referência aos selos oficiais japoneses — usado como assinatura visual
 * do sistema (login, sidebar, estados de confirmação).
 */
export function HankoMark({
  size = 40,
  className,
  character = "早",
}: {
  size?: number;
  className?: string;
  character?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Selo Sakaland"
    >
      <defs>
        <filter id="hanko-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke="#B8362A" strokeWidth="3.5" filter="url(#hanko-rough)" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#B8362A" strokeWidth="1" opacity="0.5" filter="url(#hanko-rough)" />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#B8362A"
        fontFamily="var(--font-display), serif"
        fontSize="28"
        fontWeight="700"
        filter="url(#hanko-rough)"
      >
        {character}
      </text>
    </svg>
  );
}
