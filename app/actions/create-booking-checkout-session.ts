"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const inputSchema = z.object({
  serviceId: z.uuid(),
  date: z.date(),
});

export const createBookingCheckoutSession = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date } }) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return {
          success: false,
          error: "Stripe não está configurado no servidor.",
        };
      }

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return {
          success: false,
          error: "User must be logged in",
        };
      }

      const service = await prisma.barbershopService.findUnique({
        where: { id: serviceId },
        include: { barberShop: true },
      });

      if (!service) {
        return {
          success: false,
          error: "Serviço não encontrado",
        };
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-10-29.clover",
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",

        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,

        metadata: {
          userId: session.user.id,
          serviceId,
          date: date.toISOString(),
          barberShopId: service.barberShopId,
        },

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "brl",
              unit_amount: service.priceInCents,
              product_data: {
                name: `${service.barberShop.name} - ${service.name} em ${format(
                  date,
                  "dd/MM/yyyy HH:mm",
                  { locale: ptBR }
                )}`,
                description: service.description,
                images: service.imageUrl ? [service.imageUrl] : undefined,
              },
            },
          },
        ],
      });

      return {
        success: true,
        url: checkoutSession.url!,
      };
    } catch (error) {
      console.error("Erro ao criar checkout session:", error);
      return {
        success: false,
        error: "Erro ao criar a sessão de pagamento",
      };
    }
  });
