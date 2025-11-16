"use server";
import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const inputSchema = z.object({
    serviceId: z.uuid(),
    date: z.date(),
  });

  export const createBooking = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date } }) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        returnValidationErrors(inputSchema, { _errors: ["Não autorizado"] });
    }
    const service = await prisma.barbershopService.findUnique({
        where: {
            id: serviceId,
        },
    })
    if (!service) {
        returnValidationErrors(inputSchema, { _errors: ["Serviço não encontrado"] });
    }
    const existingBooking = await prisma.booking.findFirst({
        where: {
            barberShopId: service.barberShopId,
            date,
        }
    })
    if (existingBooking) {
        console.error("Booking already exists");
        returnValidationErrors(inputSchema, { _errors: ["Agendamento já existe nessa data e hora"] });
    }
    const booking = await prisma.booking.create({
        data: {
            serviceId,
            date,
            userId: session.user.id,
            barberShopId: service.barberShopId
        }
    })

    revalidatePath("/bookings")
    revalidatePath("/")

    return booking;
  }
  );