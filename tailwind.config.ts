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
        // Paleta "Hanko": tinta de selo (vermelhão), papel e tinta sumi,
        // inspirada nos carimbos oficiais japoneses e em livros-razão.
        sakaland: {
          black: "#161009",     // sumi — tinta profunda, base do fundo
          surface: "#211810",    // superfície de cartões
          surface2: "#2B2013",  // superfície secundária (hover, inputs)
          red: "#B8362A",         // shu — vermelhão do carimbo (cor primária)
          redDark: "#7C2119",    // tinta do carimbo em estado pressionado
          white: "#F1E7D3",        // washi — papel claro
          gold: "#B6893F",          // kin — ouro envelhecido (moeda/1º lugar)
          silver: "#B6AC98",          // prata envelhecida (2º lugar)
          bronze: "#93673F",          // bronze (3º lugar)
          muted: "#A0937C",             // texto secundário sobre papel
          indigo: "#3C5670",              // ai — azil-anil, acento secundário de dados
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "sakaland-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(184,54,42,0.16) 0%, rgba(22,16,9,0) 70%)",
        "seal-ring":
          "conic-gradient(from 90deg, #B8362A, #7C2119, #B8362A)",
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
