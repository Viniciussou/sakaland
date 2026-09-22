import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sakaland-black text-center px-4">
      <Compass className="w-10 h-10 text-sakaland-primary mb-4" />
      <h1 className="font-display text-4xl mb-2">404</h1>
      <p className="text-sakaland-muted mb-6">Esta página não existe no Sakaland.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-sakaland-primary text-white text-sm font-medium hover:bg-sakaland-primaryDark transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
