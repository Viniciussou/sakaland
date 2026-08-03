"use server";

import connectToDatabase from "@/lib/mongodb";
import { Log } from "@/models";
import { requireAdmin } from "@/lib/auth";

export interface LogListItem {
  id: string;
  actorName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

export async function listLogs(limit = 100): Promise<LogListItem[]> {
  await requireAdmin();
  await connectToDatabase();

  const logs = await Log.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "name")
    .lean();

  return logs.map((l) => ({
    id: l._id.toString(),
    actorName: (l.actor as any)?.name || "Sistema",
    action: l.action,
    targetType: l.targetType,
    targetId: l.targetId,
    details: l.details as Record<string, unknown> | undefined,
    ip: l.ip,
    createdAt: l.createdAt.toISOString(),
  }));
}

const LOG_PAGE_SIZE = 25;

export interface PaginatedLogs {
  logs: LogListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listLogsPaginated(page = 1): Promise<PaginatedLogs> {
  await requireAdmin();
  await connectToDatabase();

  const safePage = Math.max(1, page);
  const [logs, total] = await Promise.all([
    Log.find()
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * LOG_PAGE_SIZE)
      .limit(LOG_PAGE_SIZE)
      .populate("actor", "name")
      .lean(),
    Log.countDocuments(),
  ]);

  return {
    logs: logs.map((l) => ({
      id: l._id.toString(),
      actorName: (l.actor as any)?.name || "Sistema",
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      details: l.details as Record<string, unknown> | undefined,
      ip: l.ip,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / LOG_PAGE_SIZE)),
  };
}
