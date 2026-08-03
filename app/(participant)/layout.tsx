import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(session.userId).select("balance name").lean();
  if (!user) redirect("/login");

  return (
    <AppShell role="participant" name={session.name} balance={user.balance}>
      {children}
    </AppShell>
  );
}
