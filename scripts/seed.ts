/**
 * Script de inicialização do banco de dados do Sakaland.
 * Cria um administrador, participantes de exemplo, metas, brindes e
 * configurações gerais do evento.
 *
 * Uso: npm run seed
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Reward, Goal, Setting, Transaction } from "../models";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Defina MONGODB_URI no arquivo .env.local antes de rodar o seed.");
  process.exit(1);
}

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Conectando ao MongoDB...");
  await mongoose.connect(MONGODB_URI as string);

  console.log("🧹 Limpando coleções existentes...");
  await Promise.all([
    User.deleteMany({}),
    Reward.deleteMany({}),
    Goal.deleteMany({}),
    Setting.deleteMany({}),
    Transaction.deleteMany({}),
  ]);

  console.log("👤 Criando administrador...");
  const admin = await User.create({
    name: "Administrador Sakaland",
    email: "admin@sakaland.com",
    passwordHash: await hash("Admin@123"),
    role: "admin",
    department: "Organização",
    balance: 0,
  });

  console.log("👥 Criando participantes de exemplo...");
  const participantsData = [
    { name: "Ana Souza", department: "Marketing", balance: 850 },
    { name: "Bruno Lima", department: "Vendas", balance: 620 },
    { name: "Carla Nunes", department: "Tecnologia", balance: 1200 },
    { name: "Diego Alves", department: "Financeiro", balance: 340 },
    { name: "Elisa Prado", department: "RH", balance: 990 },
    { name: "Felipe Rocha", department: "Tecnologia", balance: 75 },
    { name: "Gabriela Dias", department: "Marketing", balance: 430 },
  ];

  const participants = await Promise.all(
    participantsData.map((p, i) =>
      User.create({
        name: p.name,
        email: `participante${i + 1}@sakaland.com`,
        passwordHash: bcrypt.hashSync("Participante@123", 10),
        role: "participant",
        department: p.department,
        balance: p.balance,
      })
    )
  );

  console.log("💰 Registrando transações iniciais...");
  for (const [i, user] of participants.entries()) {
    await Transaction.create({
      user: user._id,
      type: "credit",
      source: "admin_grant",
      amount: participantsData[i].balance,
      balanceAfter: participantsData[i].balance,
      note: "Saldo inicial de boas-vindas",
      performedBy: admin._id,
    });
  }

  console.log("🎯 Criando metas de exemplo...");
  const now = new Date();
  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(now.getDate() + 14);
  const inOneMonth = new Date(now);
  inOneMonth.setMonth(now.getMonth() + 1);

  await Goal.create([
    {
      title: "Participar da abertura do evento",
      description: "Compareça à cerimônia de abertura do Sakaland e faça check-in.",
      reward: 100,
      startDate: now,
      endDate: inTwoWeeks,
      isActive: true,
    },
    {
      title: "Completar a trilha de workshops",
      description: "Participe de pelo menos 3 workshops durante o evento.",
      reward: 250,
      startDate: now,
      endDate: inOneMonth,
      isActive: true,
    },
    {
      title: "Indicar um colega",
      description: "Convide um colega para se cadastrar na plataforma Sakaland.",
      reward: 150,
      startDate: now,
      endDate: inOneMonth,
      isActive: true,
    },
  ]);

  console.log("🎁 Criando brindes da loja...");
  await Reward.create([
    {
      name: "Camiseta Sakaland",
      description: "Camiseta exclusiva do evento, 100% algodão.",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      stock: 40,
      price: 200,
      category: "Vestuário",
      featured: true,
      isActive: true,
    },
    {
      name: "Garrafa térmica Sakamoto",
      description: "Garrafa térmica de aço inox com logo da empresa.",
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
      stock: 25,
      price: 350,
      category: "Acessórios",
      featured: true,
      isActive: true,
    },
    {
      name: "Fone de ouvido Bluetooth",
      description: "Fone sem fio com cancelamento de ruído.",
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      stock: 10,
      price: 900,
      category: "Eletrônicos",
      featured: true,
      isActive: true,
    },
    {
      name: "Vale-almoço",
      description: "Vale-almoço para usar durante o evento.",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
      stock: 60,
      price: 120,
      category: "Alimentação",
      featured: false,
      isActive: true,
    },
    {
      name: "Caderno + caneta Sakaland",
      description: "Kit de papelaria personalizado do evento.",
      imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800",
      stock: 0,
      price: 80,
      category: "Papelaria",
      featured: false,
      isActive: true,
    },
  ]);

  console.log("⚙️  Criando configurações gerais...");
  await Setting.create({
    eventName: "Sakaland",
    eventStartDate: now,
    eventEndDate: inOneMonth,
    currencyName: "Sakalekas",
    currencySingular: "Sakaleka",
    primaryColor: "#C8102E",
  });

  console.log("\n✅ Seed concluído com sucesso!\n");
  console.log("Credenciais de acesso:");
  console.log("  Admin:       admin@sakaland.com / Admin@123");
  console.log("  Participante: participante1@sakaland.com / Participante@123");
  console.log("  (participante2 a participante7 seguem o mesmo padrão)\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro ao executar o seed:", err);
  process.exit(1);
});
