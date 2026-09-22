import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const displayFont = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sakamoto | Evento Corporativo",
  description:
    "Sistema gamificado do evento — cumpra metas, acumule Sakalekas e troque por brindes exclusivos.",
};

// Sistema opera apenas em modo noturno — sem alternância de tema.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#0E1815",
              border: "1px solid rgba(240,244,242,0.08)",
              color: "#F0F4F2",
            },
          }}
        />
      </body>
    </html>
  );
}
