"use server";

import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import Stripe from "stripe";
import z from "zod";

const inputSchema = z.object({
  bookingId: z.string().uuid(),
});

export const rescheduleBooking = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { bookingId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Não autorizado"],
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, barbershop: true },
    });

    if (!booking) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Agendamento não encontrado"],
      });
    }

    if (booking.userId !== session.user.id) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Agendamento não pertence ao usuário"],
      });
    }

    if (!booking.cancelled) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Este agendamento não está cancelado (não pode reagendar)."],
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-10-29.clover",
    });

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings?cancel=1`,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: booking.service.name,
              description: `Reagendamento do serviço em ${booking.barbershop.name}`,
            },
            unit_amount: booking.service.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "reschedule",
        bookingId: booking.id,
      },
    });

    return { url: checkout.url };
  });
