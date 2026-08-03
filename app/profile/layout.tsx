import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(session.userId).select("balance").lean();

  return (
    <AppShell
      role={session.role}
      name={session.name}
      balance={session.role === "participant" ? user?.balance : undefined}
      title="Meu perfil"
    >
      {children}
    </AppShell>
  );
}
