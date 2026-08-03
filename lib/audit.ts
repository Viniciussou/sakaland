import { Log } from "@/models";
import connectToDatabase from "@/lib/mongodb";

interface AuditParams {
  actor?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

/**
 * Registra uma entrada de auditoria. Nunca lança erro para o chamador —
 * uma falha ao gravar o log não deve interromper a operação principal.
 */
export async function recordLog(params: AuditParams) {
  try {
    await connectToDatabase();
    await Log.create({
      actor: params.actor || undefined,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details,
      ip: params.ip,
    });
  } catch (err) {
    console.error("[audit] falha ao registrar log:", err);
  }
}
