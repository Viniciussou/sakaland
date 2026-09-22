import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Paginação server-friendly baseada em links (?page=N) — não depende de
 * JavaScript no cliente, cada página é renderizada no servidor sob demanda,
 * evitando carregar o histórico inteiro de uma vez.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams || {})) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
      <p className="text-xs text-sakaland-muted">
        Página <span className="font-numeric text-sakaland-white">{page}</span> de{" "}
        <span className="font-numeric text-sakaland-white">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={buildHref(Math.max(1, page - 1))}
          aria-disabled={page === 1}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-sakaland-muted hover:text-sakaland-white hover:border-white/20 transition-colors",
            page === 1 && "pointer-events-none opacity-30"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 && (
              <span className="px-1 text-sakaland-muted text-xs">···</span>
            )}
            <Link
              href={buildHref(p)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-numeric transition-colors",
                p === page
                  ? "bg-sakaland-primary text-white"
                  : "text-sakaland-muted hover:text-sakaland-white hover:bg-white/5 border border-transparent"
              )}
            >
              {p}
            </Link>
          </span>
        ))}

        <Link
          href={buildHref(Math.min(totalPages, page + 1))}
          aria-disabled={page === totalPages}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-sakaland-muted hover:text-sakaland-white hover:border-white/20 transition-colors",
            page === totalPages && "pointer-events-none opacity-30"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
