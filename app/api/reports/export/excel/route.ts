import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectToDatabase from "@/lib/mongodb";
import { User, Transaction, Purchase } from "@/models";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await connectToDatabase();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sakaland";
  workbook.created = new Date();

  // --- Aba de participantes ---
  const usersSheet = workbook.addWorksheet("Participantes");
  usersSheet.columns = [
    { header: "Nome", key: "name", width: 28 },
    { header: "E-mail", key: "email", width: 30 },
    { header: "Departamento", key: "department", width: 20 },
    { header: "Saldo (Sakalekas)", key: "balance", width: 18 },
    { header: "Status", key: "status", width: 14 },
    { header: "Cadastrado em", key: "createdAt", width: 18 },
  ];
  const users = await User.find({ role: "participant" }).sort({ balance: -1 }).lean();
  users.forEach((u) => {
    usersSheet.addRow({
      name: u.name,
      email: u.email,
      department: u.department || "-",
      balance: u.balance,
      status: u.isBlocked ? "Bloqueado" : "Ativo",
      createdAt: u.createdAt.toLocaleDateString("pt-BR"),
    });
  });
  usersSheet.getRow(1).font = { bold: true };

  // --- Aba de transações ---
  const txSheet = workbook.addWorksheet("Transações");
  txSheet.columns = [
    { header: "Participante", key: "user", width: 28 },
    { header: "Tipo", key: "type", width: 12 },
    { header: "Origem", key: "source", width: 20 },
    { header: "Valor", key: "amount", width: 12 },
    { header: "Saldo após", key: "balanceAfter", width: 14 },
    { header: "Observação", key: "note", width: 30 },
    { header: "Data", key: "createdAt", width: 18 },
  ];
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .lean();
  transactions.forEach((t) => {
    txSheet.addRow({
      user: (t.user as any)?.name || "Removido",
      type: t.type === "credit" ? "Crédito" : "Débito",
      source: t.source,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      note: t.note || "",
      createdAt: t.createdAt.toLocaleString("pt-BR"),
    });
  });
  txSheet.getRow(1).font = { bold: true };

  // --- Aba de resgates ---
  const purchasesSheet = workbook.addWorksheet("Resgates");
  purchasesSheet.columns = [
    { header: "Participante", key: "user", width: 28 },
    { header: "Brinde", key: "reward", width: 28 },
    { header: "Valor", key: "price", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Data", key: "createdAt", width: 18 },
  ];
  const purchases = await Purchase.find()
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .lean();
  purchases.forEach((p) => {
    purchasesSheet.addRow({
      user: (p.user as any)?.name || "Removido",
      reward: p.rewardNameSnapshot,
      price: p.priceSnapshot,
      status: p.status,
      createdAt: p.createdAt.toLocaleString("pt-BR"),
    });
  });
  purchasesSheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="sakaland-relatorio-${Date.now()}.xlsx"`,
    },
  });
}
