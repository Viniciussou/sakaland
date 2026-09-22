import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Lubrax: verde da marca como cor dominante sobre fundo
        // quase-preto, com azul reservado para detalhes/acentos.
        sakaland: {
          black: "#080D0B",        // fundo — preto com leve tom esverdeado
          surface: "#0E1815",       // superfície de cartões
          surface2: "#152621",      // superfície secundária (hover, inputs)
          primary: "#0E8A3E",         // verde principal (ações, links, marca)
          primaryDark: "#004415",       // verde profundo do logo (hover, pressed)
          white: "#F0F4F2",                // texto claro
          accent: "#2F80ED",                 // azul de detalhe (destaques, moeda, 1º lugar)
          accentDark: "#1B5FC4",               // azul mais escuro (hover em elementos de acento)
          silver: "#B9C2BC",                   // prata (2º lugar)
          bronze: "#9C7A4A",                     // bronze (3º lugar)
          muted: "#7E938A",                        // texto secundário
          indigo: "#173B66",                         // azul profundo — série secundária de gráficos
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "sakaland-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(14,138,62,0.20) 0%, rgba(8,20,16,0) 70%)",
      },
      animation: {
        "coin-flip": "coinFlip 0.9s cubic-bezier(.4,0,.2,1)",
        "fade-up": "fadeUp 0.5s ease-out",
        shimmer: "shimmer 1.8s linear infinite",
        stamp: "stampImpact 0.45s cubic-bezier(.2,1.4,.4,1)",
      },
      keyframes: {
        coinFlip: {
          "0%": { transform: "rotateY(0deg) scale(1)" },
          "50%": { transform: "rotateY(180deg) scale(1.08)" },
          "100%": { transform: "rotateY(360deg) scale(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        stampImpact: {
          "0%": { transform: "scale(1.6) rotate(-8deg)", opacity: "0" },
          "60%": { transform: "scale(0.95) rotate(-8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
