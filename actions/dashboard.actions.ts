"use server";

import connectToDatabase from "@/lib/mongodb";
import { User, Transaction, Purchase, Goal, Log } from "@/models";
import { requireAdmin, requireSession } from "@/lib/auth";

export async function getAdminDashboardStats() {
  await requireAdmin();
  await connectToDatabase();

  const [
    totalParticipants,
    totalSakalekasAgg,
    totalRewardsDelivered,
    completedGoalsAgg,
    topParticipants,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments({ role: "participant" }),
    Transaction.aggregate([
      { $match: { type: "credit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Purchase.countDocuments({ status: { $in: ["pending", "delivered"] } }),
    Goal.aggregate([
      { $project: { count: { $size: "$completedBy" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]),
    User.find({ role: "participant" })
      .sort({ balance: -1 })
      .limit(5)
      .select("name balance")
      .lean(),
    Log.find().sort({ createdAt: -1 }).limit(8).populate("actor", "name").lean(),
  ]);

  // Uso do sistema nos últimos 7 dias (baseado em transações)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyUsageRaw = await Transaction.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        credits: {
          $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] },
        },
        debits: {
          $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyUsage = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    const found = dailyUsageRaw.find((r) => r._id === key);
    dailyUsage.push({
      date: key,
      label: d.toLocaleDateString("pt-BR", { weekday: "short" }),
      credits: found?.credits || 0,
      debits: found?.debits || 0,
    });
  }

  return {
    totalParticipants,
    totalSakalekasDistributed: totalSakalekasAgg[0]?.total || 0,
    totalRewardsDelivered,
    completedGoals: completedGoalsAgg[0]?.total || 0,
    ranking: topParticipants.map((u, i) => ({
      position: i + 1,
      name: u.name,
      balance: u.balance,
    })),
    recentLogs: recentLogs.map((l) => ({
      id: l._id.toString(),
      action: l.action,
      actorName: (l.actor as any)?.name || "Sistema",
      createdAt: l.createdAt.toISOString(),
    })),
    dailyUsage,
  };
}

export async function getParticipantDashboard() {
  const session = await requireSession();
  await connectToDatabase();

  const user = await User.findById(session.userId).select("balance name").lean();
  const myBalance = user?.balance || 0;

  const [activeGoals, recentTransactions, position, completedGoalsCount] = await Promise.all([
    Goal.find({ isActive: true, endDate: { $gte: new Date() } })
      .sort({ endDate: 1 })
      .limit(5)
      .lean(),
    Transaction.find({ user: session.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    User.countDocuments({
      role: "participant",
      balance: { $gt: myBalance },
    }),
    Goal.countDocuments({ completedBy: session.userId }),
  ]);

  return {
    name: user?.name || session.name,
    balance: myBalance,
    rankPosition: position + 1,
    activeGoals: activeGoals.map((g) => ({
      id: g._id.toString(),
      title: g.title,
      description: g.description,
      reward: g.reward,
      endDate: g.endDate.toISOString(),
      completedByMe: g.completedBy?.some((id) => id.toString() === session.userId),
    })),
    completedGoalsCount,
    recentTransactions: recentTransactions.map((t) => ({
      id: t._id.toString(),
      type: t.type,
      amount: t.amount,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

export interface RankingEntry {
  position: number;
  id: string;
  name: string;
  department?: string;
  avatarUrl?: string;
  balance: number;
}

export async function getRanking(): Promise<{
  top10: RankingEntry[];
  me: RankingEntry | null;
}> {
  const session = await requireSession();
  await connectToDatabase();

  const allParticipants = await User.find({ role: "participant" })
    .sort({ balance: -1 })
    .select("name balance department avatarUrl")
    .lean();

  const top10 = allParticipants.slice(0, 10).map((u, i) => ({
    position: i + 1,
    id: u._id.toString(),
    name: u.name,
    department: u.department,
    avatarUrl: u.avatarUrl,
    balance: u.balance,
  }));

  const myIndex = allParticipants.findIndex(
    (u) => u._id.toString() === session.userId
  );

  const me =
    myIndex >= 0
      ? {
          position: myIndex + 1,
          id: allParticipants[myIndex]._id.toString(),
          name: allParticipants[myIndex].name,
          department: allParticipants[myIndex].department,
          avatarUrl: allParticipants[myIndex].avatarUrl,
          balance: allParticipants[myIndex].balance,
        }
      : null;

  return { top10, me };
}
