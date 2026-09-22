import { Logo } from "@/components/brand/logo";

const steps = [
  { title: "Cumpra metas", detail: "Participe de ações do evento e conclua desafios" },
  { title: "Acumule Sakalekas", detail: "A moeda oficial credita automaticamente em sua conta" },
  { title: "Resgate brindes", detail: "Troque o saldo por itens exclusivos da loja" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-sakaland-black">
      {/* Coluna visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-sakaland-glow" />
        <div className="absolute -right-40 -top-40 w-[28rem] h-[28rem] rounded-full bg-sakaland-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 w-96 h-96 rounded-full bg-sakaland-accent/[0.08] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.4]" style={{
          backgroundImage: "linear-gradient(rgba(240,244,242,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 42px",
        }} />

        <div className="relative z-10">
          <Logo height={30} />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-sakaland-primary mb-4">
            Evento corporativo
          </p>
          <h1 className="font-display text-5xl leading-[1.15] mb-6">
            Cumpra metas.
            <br />
            Acumule <span className="text-sakaland-accent">Sakalekas</span>.
            <br />
            Resgate brindes.
          </h1>
          <p className="text-sakaland-muted leading-relaxed">
            A moeda oficial do evento recompensa quem participa, colabora e
            conquista objetivos. Cada conquista fica registrada no seu
            extrato pessoal.
          </p>
        </div>

        <ol className="relative z-10 space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full border border-sakaland-primary/50 flex items-center justify-center text-xs font-numeric text-sakaland-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm text-sakaland-white font-medium">{step.title}</p>
                <p className="text-xs text-sakaland-muted mt-0.5">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Coluna do formulário */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 lg:hidden bg-sakaland-glow" />
        <div className="relative z-10 w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Logo height={28} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
