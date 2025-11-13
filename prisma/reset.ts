import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";

// Carrega as variáveis de ambiente do arquivo .env
config();

const prisma = new PrismaClient();

async function reset() {
  try {
    // TRUNCATE todas as tabelas de serviço e barbearia
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "BarbershopService", "Barbershop" 
      RESTART IDENTITY CASCADE;
    `);

    console.log("Tabelas truncadas com sucesso!");
  } catch (error) {
    console.error("Erro ao truncar tabelas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
