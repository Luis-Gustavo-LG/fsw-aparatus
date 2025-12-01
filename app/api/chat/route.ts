import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { getDateAvailableTimeSlots } from "@/app/actions/get-date-available-time-slots";
import { createBookingCheckoutSession } from "@/app/actions/create-booking-checkout-session";

export const POST = async (request: Request) => {
  const { messages } = await request.json();
  const result = streamText({
    model: google("gemini-2.0-flash"),
    stopWhen: stepCountIs(10),
    system: `Você é o Agenda.ai, um assistente virtual de agendamento de barbearias.

    DATA ATUAL: Hoje é ${new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} (${new Date().toISOString().split("T")[0]})

    Seu objetivo é ajudar os usuários a:
    - Encontrar barbearias (por nome ou todas disponíveis)
    - Verificar disponibilidade de horários para barbearias específicas
    - Fornecer informações sobre serviços e preços

    Fluxo de atendimento:

    CENÁRIO 1 - Usuário menciona data/horário na primeira mensagem (ex: "quero um corte pra hoje", "preciso cortar o cabelo amanhã", "quero marcar para sexta"):
    1. Use a ferramenta searchBarbershops para buscar barbearias
    2. IMEDIATAMENTE após receber as barbearias, use a ferramenta getAvailableTimeSlotsForBarbershop para CADA barbearia retornada, passando a data mencionada pelo usuário
    3. Apresente APENAS as barbearias que têm horários disponíveis, mostrando:
       - Nome da barbearia
       - Endereço
       - Serviços oferecidos com preços
       - Alguns horários disponíveis (4-5 opções espaçadas)
    4. Quando o usuário escolher, forneça o resumo final

    CENÁRIO 2 - Usuário não menciona data/horário inicialmente:
    1. Use a ferramenta searchBarbershops para buscar barbearias
    2. Apresente as barbearias encontradas com:
       - Nome da barbearia
       - Endereço
       - Serviços oferecidos com preços
    3. Quando o usuário demonstrar interesse em uma barbearia específica ou mencionar uma data, pergunte a data desejada (se ainda não foi informada)
    4. Use a ferramenta getAvailableTimeSlotsForBarbershop passando o barbershopId e a data
    5. Apresente os horários disponíveis (liste alguns horários, não todos - sugira 4-5 opções espaçadas)

    Resumo final (quando o usuário escolher):
    - Nome da barbearia
    - Endereço
    - Serviço escolhido
    - Data e horário escolhido
    - Preço

    Criação da reserva:
    - Após o usuário confirmar explicitamente a escolha (ex: "confirmo", "pode agendar", "quero esse horário"), use a ferramenta createBookingCheckoutSession
    - Parâmetros necessários:
      * serviceId: ID do serviço escolhido
      * date: Data e horário no formato ISO (YYYY-MM-DDTHH:mm:ss) - exemplo: "2025-11-05T10:00:00"
    - Se a criação for bem-sucedida (success: true), direcione o usuário para o link de pagamento
    - Se houver erro (success: false), explique o erro ao usuário:
      * Se o erro for "User must be logged in", informe que é necessário fazer login para criar uma reserva
      * Para outros erros, informe que houve um problema e peça para tentar novamente

    Importante:
    - NUNCA mostre informações técnicas ao usuário (barbershopId, serviceId, formatos ISO de data, etc.)
    - Seja sempre educado, prestativo e use uma linguagem informal e amigável
    - Não liste TODOS os horários disponíveis, sugira apenas 4-5 opções espaçadas ao longo do dia
    - Se não houver horários disponíveis, sugira uma data alternativa
    - Quando o usuário mencionar "hoje", "amanhã", "depois de amanhã" ou dias da semana, calcule a data correta automaticamente`,
    messages: convertToModelMessages(messages),
    tools: {
      searchBarbershops: tool({
        description:
          "Pesquisa barbearias pelo nome. Se nenhum nome é fornecido, retorna todas as barbearias.",
        inputSchema: z.object({
          name: z.string().optional().describe("Nome opcional da barbearia"),
        }),
        execute: async ({ name }) => {
          if (!name?.trim()) {
            const barbershops = await prisma.barbershop.findMany({
              include: {
                services: true,
              },
            });
            return barbershops.map((barbershop) => ({
              barbershopId: barbershop.id,
              name: barbershop.name,
              address: barbershop.address,
              services: barbershop.services.map((service) => ({
                id: service.id,
                name: service.name,
                price: service.priceInCents / 100,
              })),
            }));
          }
          const barbershops = await prisma.barbershop.findMany({
            where: {
              name: {
                contains: name,
                mode: "insensitive",
              },
            },
            include: {
              services: true,
            },
          });
          return barbershops.map((barbershop) => ({
            barbershopId: barbershop.id,
            name: barbershop.name,
            address: barbershop.address,
            services: barbershop.services.map((service) => ({
              id: service.id,
              name: service.name,
              price: service.priceInCents / 100,
            })),
          }));
        },
      }),
      getAvailableTimeSlotsForBarbershop: tool({
        description:
          "Obtém os horários disponíveis para uma barbearia em uma data específica.",
        inputSchema: z.object({
          barbershopId: z.string().describe("ID da barbearia"),
          date: z
            .string()
            .describe(
              "Data no formato YYYY-MM-DD para a qual deseja obter os horários disponíveis",
            ),
        }),
        execute: async ({ barbershopId, date }) => {
          const parsedDate = new Date(date);
          const result = await getDateAvailableTimeSlots({
            barberShopId: barbershopId,
            date: parsedDate,
          });
          if (result.serverError || result.validationErrors) {
            return {
              error:
                result.validationErrors?._errors?.[0] ||
                "Erro ao buscar horários disponíveis",
            };
          }
          return {
            barbershopId,
            date,
            availableTimeSlots: result.data,
          };
        },
      }),
      createBookingCheckoutSession: tool({
  description:
    "Cria uma checkout session no Stripe para realizar o pagamento do agendamento.",
  inputSchema: z.object({
    serviceId: z.string(),
    date: z.string(),
  }),
  execute: async ({ serviceId, date }) => {
    const parsedDate = new Date(date);

    const result = await createBookingCheckoutSession({
      serviceId,
      date: parsedDate,
    });

    if ("validationErrors" in result) {
      return {
        error:
          result.validationErrors?._errors?.[0] ||
          "Erro de validação ao criar sessão de pagamento",
      };
    }

    if ("serverError" in result) {
      return {
        error: result.serverError || "Erro interno ao criar sessão de pagamento",
      };
    }

    if (result?.data?.success) {
      return {
        text: `Tudo certo! 🎉  
Para concluir seu agendamento, finalize o pagamento aqui:

👉 [Finalizar pagamento](${result.data.url})`,
      };
    }

    return {
      error: result?.data?.error || "Erro desconhecido ao criar sessão",
    };
  },
})

    },
  });
  return result.toUIMessageStreamResponse();
};