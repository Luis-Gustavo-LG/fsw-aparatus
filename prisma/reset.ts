import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";

config();
const prisma = new PrismaClient();

async function reset() {
  try {
    console.log("🧨 Resetando tabelas no PostgreSQL...");

    // TRUNCATE precisa ser na ordem: filhos → pais
    // CASCADE remove automaticamente dependências
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "BarbershopService",
        "Barbershop",
        "Booking"
      RESTART IDENTITY CASCADE;
    `);

    console.log("✔️ Tabelas truncadas com sucesso!");
  } catch (error) {
    console.error("Erro ao truncar tabelas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
