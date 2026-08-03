import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findById(session.userId)
    .select("name email role balance department avatarUrl isBlocked")
    .lean();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      department: user.department,
      avatarUrl: user.avatarUrl,
      isBlocked: user.isBlocked,
    },
  });
}
