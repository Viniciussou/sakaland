import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import connectToDatabase from "@/lib/mongodb";
import { User, Transaction, Purchase, Goal } from "@/models";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await connectToDatabase();

  const [totalParticipants, totalTransactions, totalPurchases, totalGoals, topParticipants] =
    await Promise.all([
      User.countDocuments({ role: "participant" }),
      Transaction.countDocuments(),
      Purchase.countDocuments(),
      Goal.countDocuments(),
      User.find({ role: "participant" }).sort({ balance: -1 }).limit(10).lean(),
    ]);

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Cabeçalho
  doc.fillColor("#C8102E").fontSize(24).text("Sakaland", { continued: false });
  doc.fillColor("#000000").fontSize(12).text("Relatório do evento corporativo Sakamoto");
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor("#666666").text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);
  doc.moveDown(1.5);

  // Resumo
  doc.fillColor("#000000").fontSize(14).text("Resumo geral", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11);
  doc.text(`Total de participantes: ${totalParticipants}`);
  doc.text(`Total de transações registradas: ${totalTransactions}`);
  doc.text(`Total de resgates na loja: ${totalPurchases}`);
  doc.text(`Total de metas cadastradas: ${totalGoals}`);
  doc.moveDown(1.5);

  // Ranking
  doc.fontSize(14).text("Top 10 participantes", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11);
  topParticipants.forEach((u, i) => {
    doc.text(`${i + 1}. ${u.name} — ${u.balance} Sakalekas`);
  });

  doc.end();
  const buffer = await done;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sakaland-relatorio-${Date.now()}.pdf"`,
    },
  });
}
