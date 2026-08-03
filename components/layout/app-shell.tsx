import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";

export function AppShell({
  role,
  name,
  balance,
  title,
  children,
}: {
  role: "admin" | "participant";
  name: string;
  balance?: number;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-sakaland-black">
      <Sidebar role={role} />
      <div className="flex-1 min-w-0">
        <Topbar name={name} role={role} balance={balance} title={title} />
        <main className="p-4 sm:p-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileNav role={role} />
    </div>
  );
}
